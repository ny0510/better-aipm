//
//  PowerWidgetBundle.swift
//  PowerWidget
//
//  Created by ny64 on 7/19/26.
//

import WidgetKit
import SwiftUI

@main
struct PowerWidgetBundle: WidgetBundle {
    var body: some Widget {
        PowerWidget()
    }
}

struct PowerWidget: Widget {
    let kind: String = "PowerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PowerWidgetView(entry: entry)
        }
        .configurationDisplayName("다원 파워매니저")
        .description("현재 전력 사용량과 이번 달 누적 요금을 표시합니다.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
