import ExpoModulesCore
import WidgetKit

// Mirrors the AsyncStorage keys used by src/api/config.ts so the widget extension
// reads the same values via the shared App Group UserDefaults suite.
private let kBaseURLKey = "dawon_api_base_url"
private let kSelectedDeviceIdKey = "dawon_selected_device_id"
private let kAppGroup = "group.kr.ny64.betteraipm"

public class WidgetConfigModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetConfig")

    // nil removes the value (mirrors AsyncStorage.removeItem semantics), so each
    // APIStorage setter/remover can call us without touching the other field.
    Function("updateBaseUrl") { (url: String?) in
      guard let defaults = UserDefaults(suiteName: kAppGroup) else { return }
      if let url = url {
        defaults.set(url, forKey: kBaseURLKey)
      } else {
        defaults.removeObject(forKey: kBaseURLKey)
      }
      WidgetCenter.shared.reloadAllTimelines()
    }

    Function("updateDeviceId") { (deviceId: String?) in
      guard let defaults = UserDefaults(suiteName: kAppGroup) else { return }
      if let deviceId = deviceId {
        defaults.set(deviceId, forKey: kSelectedDeviceIdKey)
      } else {
        defaults.removeObject(forKey: kSelectedDeviceIdKey)
      }
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
