cd $1
emconfigure ./Configure linux-generic32 no-shared no-threads no-dso no-engine no-unit-test no-ui || exit 1
sed -i.bak 's/CROSS_COMPILE=.*/CROSS_COMPILE=/g' Makefile || exit 1
sed -i.bak 's/-ldl //g' Makefile || exit 1
sed -i.bak 's/-O3/-Os/g' Makefile || exit 1
echo "Building OpenSSL..."
emmake make depend || exit 1
emmake make -j 4 || exit 1
