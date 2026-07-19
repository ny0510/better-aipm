import Charts
import SwiftUI
import WidgetKit

struct PowerWidgetView: View {
  let entry: PowerEntry
  @Environment(\.widgetFamily) private var family

  var body: some View {
    Group {
      if !entry.hasConfig {
        unconfiguredView
      } else if let errorMessage = entry.errorMessage {
        errorView(errorMessage)
      } else {
        content
      }
    }
    .widgetURL(URL(string: "better-aipm://"))
  }

  @ViewBuilder
  private var content: some View {
    switch family {
    case .systemSmall:
      smallView
    case .systemMedium:
      mediumView
    case .systemLarge:
      largeView
    default:
      smallView
    }
  }

  // MARK: - States

  private var unconfiguredView: some View {
    VStack(alignment: .leading, spacing: 6) {
      Image(systemName: "poweroutlet.type.b.fill")
        .font(.title2)
        .foregroundStyle(.secondary)
      Text("앱에서 기기를 설정해주세요")
        .font(.caption)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
  }

  private func errorView(_ message: String) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      Image(systemName: "exclamationmark.triangle")
        .font(.title3)
        .foregroundStyle(.orange)
      Text(message)
        .font(.caption)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
  }

  // MARK: - Sizes

  private var smallView: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(entry.displayName ?? "기기")
        .font(.caption)
        .foregroundStyle(.secondary)
        .lineLimit(1)
      Spacer()
      HStack(alignment: .lastTextBaseline, spacing: 6) {
        Image(systemName: entry.powered ? "bolt.fill" : "bolt.slash")
          .font(.title2)
          .foregroundStyle(entry.powered ? .yellow : .secondary)
        Text(String(format: "%.0fW", entry.currentWatt))
          .font(.system(size: 30, weight: .bold, design: .rounded))
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .padding(12)
  }

  private var compactHeader: some View {
    HStack(alignment: .top, spacing: 12) {
      VStack(alignment: .leading, spacing: 4) {
        Text(entry.displayName ?? "기기")
          .font(.caption)
          .foregroundStyle(.secondary)
          .lineLimit(1)
        HStack(alignment: .lastTextBaseline, spacing: 6) {
          Image(systemName: entry.powered ? "bolt.fill" : "bolt.slash")
            .foregroundStyle(entry.powered ? .yellow : .secondary)
          Text(String(format: "%.0fW", entry.currentWatt))
            .font(.title2.bold())
        }
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 2) {
        Text("이번 달 요금")
          .font(.caption2)
          .foregroundStyle(.secondary)
        Text("\(Int(entry.monthlyFee).formatted())원")
          .font(.title3.bold())
      }
    }
  }

  private var mediumView: some View {
    VStack(alignment: .leading, spacing: 8) {
      compactHeader
      hourlyChart(labelHours: [0, 12])
    }
    .padding(12)
  }

  private var largeView: some View {
    VStack(alignment: .leading, spacing: 8) {
      compactHeader
      Divider()
      VStack(alignment: .leading, spacing: 4) {
        Text("오늘 시간대별 전력")
          .font(.caption2)
          .foregroundStyle(.secondary)
        hourlyChart(labelHours: [0, 6, 12, 18])
      }
    }
    .padding(12)
  }

  @ViewBuilder
  private func hourlyChart(labelHours: [Int]) -> some View {
    if entry.hourlyPower.isEmpty {
      Text("데이터 없음")
        .font(.caption)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else {
      Chart(entry.hourlyPower, id: \.hour) { point in
        BarMark(x: .value("Hour", point.hour), y: .value("W", point.watt))
      }
      .chartXScale(domain: 0...23)
      .chartXAxis {
        AxisMarks(values: labelHours) { value in
          AxisGridLine()
          AxisValueLabel {
            if let hour = value.as(Int.self) {
              Text("\(hour)시")
            }
          }
        }
      }
      .chartYAxis(.hidden)
      .frame(maxHeight: .infinity)
    }
  }
}
