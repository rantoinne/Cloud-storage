# RNFileScanner.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "RNFileScanner"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  rn-file-scanner
                   DESC
  s.homepage     = "https://github.com/github_account/rn-file-scanner"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/FireKamp/opacity-file-scanner.git", :tag => "#{s.version}" }
  s.source_files = "ios/*.{h,m,swift}"
  s.dependency "React"
  s.dependency "RealmSwift", '~> 10.0'
  s.dependency "Realm", '~> 10.0'
end
