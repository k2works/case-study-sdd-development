{ packages ? import <nixpkgs> {} }:
let
  baseShell = import ../../shells/shell.nix { inherit packages; };
in
packages.mkShell {
  inherit (baseShell) pure;
  buildInputs = baseShell.buildInputs ++ (with packages; [
    ruby
    rubyPackages_3_3.solargraph
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
    echo "Ruby development environment activated"
    echo "  - Ruby: $(ruby --version | head -n 1)"
    echo "  - Bundler: $(bundle --version)"
    echo "  - Solargraph: $(solargraph --version)"
  '';
}
