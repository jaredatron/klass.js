require 'rake'

module JavascriptKlassHelper
  ROOT_DIR = File.expand_path(File.dirname(__FILE__))
  SRC_DIR  = File.join(ROOT_DIR, 'src')
  DOC_DIR  = File.join(ROOT_DIR, 'doc')
  TMP_DIR  = File.join(ROOT_DIR, 'tmp')
  TEMPLATES_DIR = File.join(ROOT_DIR, 'vendor/pdoc/templates')
  
  
  def self.build_docs
    mkdir_p TMP_DIR
    src_path = File.join(SRC_DIR, "klass.js")
    rm_rf DOC_DIR
    
    PDoc::Runner.new(src_path, {
      :output    => DOC_DIR,
      :templates => File.join(TEMPLATES_DIR, "html"),
      :index_page => 'README.markdown'
    }).run
  end
  
  def self.require_pdoc
    require_submodule('PDoc', 'pdoc')
  end
  
  def self.require_submodule(name, path)
    begin
      require path
    rescue LoadError => e
      missing_file = e.message.sub('no such file to load -- ', '')
      if missing_file == path
        puts "\nIt looks like you're missing #{name}. Just run:\n\n"
        puts "  $ git submodule init"
        puts "  $ git submodule update vendor/#{path}"
        puts "\nand you should be all set.\n\n"
      else
        puts "\nIt looks like #{name} is missing the '#{missing_file}' gem. Just run:\n\n"
        puts "  $ gem install #{missing_file}"
        puts "\nand you should be all set.\n\n"
      end
      exit
    end
  end
  
  
end

%w[pdoc].each do |name|
  $:.unshift File.join(JavascriptKlassHelper::ROOT_DIR, 'vendor', name, 'lib')
end

namespace :doc do
  desc "Builds the documentation."
  task :build => [:require] do
    JavascriptKlassHelper.build_docs
  end  
  
  task :require do
    JavascriptKlassHelper.require_pdoc
  end
end