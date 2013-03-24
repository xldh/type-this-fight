#!/usr/bin/env bash
build()
{
	cd "$(dirname $0)"
	local working_dir=`pwd`
	/usr/bin/env python bin/python/compilejs.py "${working_dir}/public/index.dev.html"
	/usr/bin/env php bin/php/minifyjs.php "${working_dir}/public/js/compiled/app.js" "${working_dir}/public/js/compiled/app.js"
	cd -
}
build