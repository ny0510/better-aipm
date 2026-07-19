require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'WidgetConfig'
  s.version        = package['version']
  s.summary        = 'Syncs Dawon API base URL and device ID to the iOS widget via App Group UserDefaults.'
  s.description    = 'Expo local module for the better-aipm React Native app. Mirrors AsyncStorage writes (base URL, selected device ID) into a shared App Group UserDefaults suite so the iOS home screen widget can call the Dawon API directly, then triggers WidgetCenter timeline reloads.'
  s.license        = 'MIT'
  s.author         = 'ny64'
  s.homepage       = 'https://github.com/ny64/better-aipm'
  s.platforms      = {
    :ios => '15.1',
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/ny64/better-aipm.git', tag: "v#{package['version']}" }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.swift'
end
