{ packages ? import <nixpkgs> {} }:
let
  baseShell = import ../../shells/shell.nix { inherit packages; };
in
packages.mkShell {
  inherit (baseShell) pure;
  buildInputs = baseShell.buildInputs ++ (with packages; [
    ruby
    bundler
    # ネイティブ gem ビルドに必要な依存
    libyaml
    pkg-config
    postgresql
    libffi
    zlib
    openssl
    gcc
    gnumake
  ]);
  shellHook = ''
    ${baseShell.shellHook}
    # nix 管理外の gem パスをクリアしてパス競合を防止
    unset GEM_HOME GEM_PATH
    echo "Ruby development environment activated"
    echo "  - Ruby: $(ruby --version | head -n 1)"
    echo "  - Bundler: $(bundle --version)"
  '';
}
