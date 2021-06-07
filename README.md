# Bhop Replay Viewer
Bhop fork of GOKZ Replay Viewer. 

## Example
https://imkservers.com/replay2/?replay=replays/bhop_easy_csgo/bhop_easy_csgo.replay

## Usage
### Export Maps
First you'll need to use [SourceUtils](https://github.com/Metapyziks/SourceUtils) to export a bunch of maps, and
host them on a web server.

### Example export.bat
```
@echo off

"SourceUtils.WebExport\bin\Debug\SourceUtils.WebExport.exe" export ^
	--maps "bhop_1derland" ^
	--outdir "resources" ^
	--gamedir "C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\csgo" ^
	--mapsdir "maps" ^
	--overwrite --verbose --url-prefix "/replay/"
```

### TODO
- Get player name
- Filtering by map/style/track
- Automatic upload of map/replay