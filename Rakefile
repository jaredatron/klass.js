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

ROOT              = Pathname(File.expand_path(File.dirname(__FILE__)))
SOURCE            = ROOT + 'src/klass.js'
PACKAGE           = ROOT + 'pkg/klass.js'
SPEC_RUNNER       = ROOT + 'spec/SpecRunner.html'
FIXTURES          = ROOT + 'spec/fixtures.js'
COMPILED_FIXTURES = ROOT + 'tmp/fixtures.js'

task :default => :test

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
  compile(SOURCE,PACKAGE);
end

task :test => :build do
  compile(FIXTURES,COMPILED_FIXTURES);
  # Launchy.open "file://localhost#{SPEC_RUNNER}"
  Launchy::Browser.run "file://localhost#{SPEC_RUNNER}"
end


def compile source, destination
  destination.parent.mkdir unless destination.parent.exist?
  Pathname(destination).open('w'){|file|
    file.write Closure::Compiler.new.compile(Pathname(source).read)
  }
end
