import Foundation
import WidgetKit

// Mirrors the subset of src/api/types.ts the widget reads. String fields are
// parsed to numbers/booleans at the call site, matching useDeviceData.ts.
struct CurrentDataResponse: Decodable {
  let powered: String?
  let current_watt: String?
  let monthly_kwh: String?
  let temperature: String?

  private enum CodingKeys: String, CodingKey { case powered, current_watt, monthly_kwh, temperature }

  init(from decoder: Decoder) throws {
    let c = try decoder.container(keyedBy: CodingKeys.self)
    powered = try? CurrentDataResponse.decodeFlexibleString(c, forKey: .powered)
    current_watt = try? CurrentDataResponse.decodeFlexibleString(c, forKey: .current_watt)
    monthly_kwh = try? CurrentDataResponse.decodeFlexibleString(c, forKey: .monthly_kwh)
    temperature = try? CurrentDataResponse.decodeFlexibleString(c, forKey: .temperature)
  }

  // API may return scalar fields as String, Bool, or Number — coerce all to String for downstream parsing.
  private static func decodeFlexibleString(_ c: KeyedDecodingContainer<CodingKeys>, forKey key: CodingKeys) throws -> String? {
    if let s = try? c.decode(String.self, forKey: key) { return s }
    if let b = try? c.decode(Bool.self, forKey: key) { return String(b) }
    if let d = try? c.decode(Double.self, forKey: key) { return String(d) }
    if let i = try? c.decode(Int.self, forKey: key) { return String(i) }
    return nil
  }
}

struct ChartDataPoint: Decodable {
  let date: String
  let value: Double
  let unit: String?

  private enum CodingKeys: String, CodingKey { case date, value, unit }

  init(from decoder: Decoder) throws {
    let c = try decoder.container(keyedBy: CodingKeys.self)
    date = try c.decode(String.self, forKey: .date)
    unit = try c.decodeIfPresent(String.self, forKey: .unit)
    // value may arrive as Number or String; coerce both to Double.
    if let d = try? c.decode(Double.self, forKey: .value) { value = d }
    else if let s = try? c.decode(String.self, forKey: .value), let d = Double(s) { value = d }
    else { value = 0 }
  }
}

struct ChartResponse: Decodable {
  let data: [ChartDataPoint]?
  let old_data: [ChartDataPoint]?
}

struct HourlyPoint {
  let hour: Int
  let watt: Double
}

struct DeviceProfileMirror: Decodable {
  let display_name: String?
}

struct DeviceMirror: Decodable {
  let device_id: String
  let device_profile: DeviceProfileMirror?
}

typealias DevicesResponse = [DeviceMirror]

// Single timeline entry carrying everything every widget size renders. Fetches
// all four endpoints together regardless of family — ponytail: 4 tiny calls
// once per 30min beat is cheaper than conditional per-family fetch logic.
struct PowerEntry: TimelineEntry {
  let date: Date
  let hasConfig: Bool
  let displayName: String?
  let currentWatt: Double
  let powered: Bool
  let monthlyFee: Double
  let hourlyPower: [HourlyPoint]
  let errorMessage: String?

  static let placeholder = PowerEntry(
    date: Date(),
    hasConfig: false,
    displayName: "기기",
    currentWatt: 0,
    powered: false,
    monthlyFee: 0,
    hourlyPower: [],
    errorMessage: nil
  )
}
