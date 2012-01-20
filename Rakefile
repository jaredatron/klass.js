# # begin
#   require 'bundler'
# # rescue
# #   require 'rubygems'
# #   require 'bundler'
# # end
# Bundler.setup
require 'closure-compiler'
require 'pathname'
require 'Launchy'

ROOT        = Pathname.new(File.expand_path(File.dirname(__FILE__)))
SRC         = ROOT + 'src/klass.js'
PKG         = ROOT + 'pkg/klass.js'
SPEC_RUNNER = ROOT + 'spec/SpecRunner.html'

namespace :doc do
  desc "Builds the documentation."
  task :build => [:require] do
    JavascriptKlassHelper.build_docs
  end

  task :require do
    require 'vendor/javascript_klass_helper'
    JavascriptKlassHelper.require_pdoc
  end
end

task :build do
  source = SRC.read
  compressed_source = Closure::Compiler.new.compile(source)
  PKG.parent.mkdir unless PKG.parent.exist?
  PKG.open('w'){|f| f.write(compressed_source) }
end

task :test => :build do
  # Launchy.open "file://localhost#{SPEC_RUNNER}"
  Launchy::Browser.run "file://localhost#{SPEC_RUNNER}"
end
