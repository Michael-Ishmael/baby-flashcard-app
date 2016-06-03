from FileCompiler import FileCompiler

try:
    creator = FileCompiler()
    creator.load()
    creator.compile_files()
    #creator.dump_csv_file()
    creator.dump_xcasset_files()
    creator.dump_app_data_json()
except:
    pass