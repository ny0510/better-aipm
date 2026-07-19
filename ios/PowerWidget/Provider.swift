import Foundation
import WidgetKit

private let kAppGroup = "group.kr.ny64.betteraipm"
private let kBaseURLKey = "dawon_api_base_url"
private let kSelectedDeviceIdKey = "dawon_selected_device_id"

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> PowerEntry { .placeholder }

  func getSnapshot(in context: Context, completion: @escaping (PowerEntry) -> Void) {
    completion(.placeholder)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<PowerEntry>) -> Void) {
    Task {
      let entry = await fetchEntry()
      // ponytail: 30 min beat — iOS coalesces to its own budget anyway, this is the upper bound.
      let next = Date().addingTimeInterval(30 * 60)
      completion(Timeline(entries: [entry], policy: .after(next)))
    }
  }

  private func fetchEntry() async -> PowerEntry {
    guard let defaults = UserDefaults(suiteName: kAppGroup),
          let baseUrlString = defaults.string(forKey: kBaseURLKey),
          let deviceId = defaults.string(forKey: kSelectedDeviceIdKey),
          let baseURL = URL(string: baseUrlString) else {
      print("[PowerWidget] no config: suiteName=\(kAppGroup), baseURL=\(UserDefaults(suiteName: kAppGroup)?.string(forKey: kBaseURLKey) ?? "nil"), deviceId=\(UserDefaults(suiteName: kAppGroup)?.string(forKey: kSelectedDeviceIdKey) ?? "nil")")
      return PowerEntry(date: Date(), hasConfig: false, displayName: nil, currentWatt: 0, powered: false, monthlyFee: 0, hourlyPower: [], errorMessage: nil)
    }
    print("[PowerWidget] config OK: baseURL=\(baseUrlString), deviceId=\(deviceId)")

    let session = URLSession.shared

    // Concurrent so all four round trips overlap; each still fails with its own URL in the error message.
    do {
      let currentURL = baseURL.appendingPathComponent("devices/\(deviceId)/current")
      let devicesURL = baseURL.appendingPathComponent("devices")
      let feeURL = chartURL(baseURL: baseURL, deviceId: deviceId, target: "day", metric: "fee")
      let hourURL = chartURL(baseURL: baseURL, deviceId: deviceId, target: "hour", metric: "power")

      async let currentTask = fetchDecodable(CurrentDataResponse.self, session: session, url: currentURL)
      async let devicesTask = fetchDecodable(DevicesResponse.self, session: session, url: devicesURL)
      async let feeTask = fetchDecodable(ChartResponse.self, session: session, url: feeURL)
      async let hourTask = fetchDecodable(ChartResponse.self, session: session, url: hourURL)

      let currentData: CurrentDataResponse
      do { currentData = try await currentTask }
      catch { return failureEntry("current\n\(currentURL)\n\(error)") }

      let devicesData: DevicesResponse
      do { devicesData = try await devicesTask }
      catch { return failureEntry("devices\n\(devicesURL)\n\(error)") }

      let feeChartData: ChartResponse
      do { feeChartData = try await feeTask }
      catch { return failureEntry("fee\n\(feeURL)\n\(error)") }

      let hourChartData: ChartResponse
      do { hourChartData = try await hourTask }
      catch { return failureEntry("hour\n\(hourURL)\n\(error)") }

      let displayName = devicesData.first(where: { $0.device_id == deviceId })?.device_profile?.display_name
      let currentWatt = currentData.current_watt.flatMap { Double($0) } ?? 0
      let powered = currentData.powered.flatMap { parseBool($0) } ?? false
      let monthlyFee = currentMonthFee(from: feeChartData)
      let hourlyPower = todayHourlyPower(from: hourChartData)

      return PowerEntry(date: Date(), hasConfig: true, displayName: displayName, currentWatt: currentWatt, powered: powered, monthlyFee: monthlyFee, hourlyPower: hourlyPower, errorMessage: nil)
    } catch {
      return failureEntry("outer\n\(error)")
    }
  }

  private func failureEntry(_ detail: String) -> PowerEntry {
    print("[PowerWidget] failed: \(detail)")
    return PowerEntry(date: Date(), hasConfig: true, displayName: nil, currentWatt: 0, powered: false, monthlyFee: 0, hourlyPower: [], errorMessage: "업데이트에 실패했어요")
  }

  private func chartURL(baseURL: URL, deviceId: String, target: String, metric: String) -> URL {
    var components = URLComponents(url: baseURL.appendingPathComponent("devices/\(deviceId)/chart"), resolvingAgainstBaseURL: false)
    components?.queryItems = [URLQueryItem(name: "target", value: target), URLQueryItem(name: "metric", value: metric)]
    return components?.url ?? baseURL
  }

  private func fetchDecodable<T: Decodable>(_ type: T.Type, session: URLSession, url: URL) async throws -> T {
    let (data, response) = try await session.data(from: url)
    if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
      throw URLError(.badServerResponse)
    }
    return try JSONDecoder().decode(T.self, from: data)
  }

  private func parseBool(_ s: String) -> Bool {
    s.lowercased() == "true" || s == "1"
  }

  // Mirrors src/hooks/useStats.ts's daily-fee fallback (lines 80-93): sum this
  // month's daily fee entries so far. Uses target=day, not target=month —
  // the in-progress month's point on the month-granularity endpoint reads
  // back as 0 until the backend closes the month out.
  private func currentMonthFee(from chart: ChartResponse) -> Double {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    formatter.timeZone = TimeZone.current
    let thisMonthStr = formatter.string(from: Date())
    return (chart.data ?? [])
      .filter { $0.date.hasPrefix(thisMonthStr) }
      .reduce(0) { $0 + $1.value }
  }

  // Mirrors src/utils/date.ts calculateAverageAndMaxPower's today filter (UTC,
  // matching the app's toISOString()-based "today" string). Hour is pulled as
  // a fixed-position substring ("yyyy-MM-ddTHH:...") rather than via a parsed
  // Date — ISO8601DateFormatter rejects backend timestamps that omit a
  // timezone offset, which was silently dropping every point (chart showing
  // "데이터 없음").
  private func todayHourlyPower(from chart: ChartResponse) -> [HourlyPoint] {
    let dayFormatter = DateFormatter()
    dayFormatter.dateFormat = "yyyy-MM-dd"
    dayFormatter.timeZone = TimeZone(identifier: "UTC")!
    let todayStr = dayFormatter.string(from: Date())
    return (chart.data ?? [])
      .filter { $0.date.hasPrefix(todayStr) }
      .compactMap { point -> HourlyPoint? in
        guard point.date.count >= 13, let hour = Int(point.date.dropFirst(11).prefix(2)) else { return nil }
        return HourlyPoint(hour: hour, watt: point.value)
      }
  }
}
