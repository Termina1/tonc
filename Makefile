BUILD_DIR = build_dist
OPENSSL=OpenSSL_1_1_0j
OPENSSL_ARCHIVE=${BUILD_DIR}/${OPENSSL}.tar.gz
OPENSSL_DIR=${BUILD_DIR}/openssl-${OPENSSL}

TON_DIR=${BUILD_DIR}/ton
TON_BUILD_DIR=${TON_DIR}/build

${BUILD_DIR}:
	mkdir -p ${BUILD_DIR} || true

${OPENSSL_ARCHIVE}: ${BUILD_DIR}
	curl -L -s -S -f https://github.com/openssl/openssl/archive/${OPENSSL}.tar.gz > ${OPENSSL_ARCHIVE}

${OPENSSL_DIR}: ${OPENSSL_ARCHIVE}
	mkdir ${OPENSSL_DIR} || true
	tar xzf ${OPENSSL_ARCHIVE} -C ${BUILD_DIR}

${TON_DIR}: ${BUILD_DIR}
	git clone https://github.com/ton-blockchain/ton.git ${TON_DIR} || true
	cd ${TON_DIR} && git -c submodule."third-party/rocksdb".update=none submodule update --init --recursive
	cd ${TON_DIR} && git checkout .

.PHONY: clean_ton
clean_ton:
	rm -rf ${TON_DIR}/build

.PHONY: build-openssl
build-openssl: ${OPENSSL_DIR}
	cd ${OPENSSL_DIR} && (make clean || true)
	cd ${OPENSSL_DIR} && ./Configure linux-generic32 no-shared no-threads no-dso no-engine no-unit-test no-ui
	cd ${OPENSSL_DIR} && make -j4

.PHONY: build-openssl-em
build-openssl-em: ${OPENSSL_DIR}
	cd ${OPENSSL_DIR} && (make clean || true)
	./build_tools/build-openssl-em.sh ${OPENSSL_DIR}

.PHONY: build-ton
build-ton: build-openssl ${TON_DIR}
	rm -rf ${TON_DIR}/build
	mkdir ${TON_BUILD_DIR} || true
	cd ${TON_DIR} && git checkout .
	cd ${TON_BUILD_DIR} && cmake -DOPENSSL_FOUND=1 -DOPENSSL_INCLUDE_DIR=${PWD}/${OPENSSL_DIR}/include \
		-DOPENSSL_CRYPTO_LIBRARY=${PWD}/${OPENSSL_DIR}/libcrypto.a \
		-DTON_ONLY_TONLIB=ON \
		-GNinja \
		-DCMAKE_BUILD_TYPE=Release ..
	cd ${TON_BUILD_DIR} && ninja fift func

.PHONY: build-ton-em
build-ton-em: build-openssl-em ${TON_DIR}
	rm -rf ${TON_DIR}/build
	mkdir ${TON_BUILD_DIR} || true
	cd ${TON_DIR} && git checkout .
	cd ${TON_DIR} && git apply ${PWD}/ton_wasm.patch
	cd ${TON_BUILD_DIR} && emcmake cmake -DOPENSSL_FOUND=1 -DOPENSSL_INCLUDE_DIR=${PWD}/${OPENSSL_DIR}/include \
		-DOPENSSL_CRYPTO_LIBRARY=${PWD}/${OPENSSL_DIR}/libcrypto.a \
		-DTON_ONLY_TONLIB=ON \
		-GNinja \
		-DCMAKE_CXX_FLAGS="-sUSE_PTHREADS=1 -sUSE_ZLIB=1" \
		-DCMAKE_BUILD_TYPE=Release .. || exit 1
	cd ${TON_BUILD_DIR} && emmake ninja fift func

.PHONY: compile
compile: build-ton build-ton-em
	cp ${TON_BUILD_DIR}/crypto/fift.* ./bin/exec
	cp ${TON_BUILD_DIR}/crypto/func.* ./bin/exec
