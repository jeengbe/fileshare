set -e

PROTOS_PATH=$(realpath "$PWD/src/proto")

rm -rf ./src/lib/proto
mkdir -p ./src/lib/proto

find $PROTOS_PATH \
  -name '*.proto' \
  -exec \
  protoc \
  --proto_path $PROTOS_PATH \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./src/lib/proto \
  {} \;
