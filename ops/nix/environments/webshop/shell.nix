{ packages ? import <nixpkgs> {} }:
let
  baseShell = import ../../shells/shell.nix { inherit packages; };
in
packages.mkShell {
  inherit (baseShell) pure;
  buildInputs = baseShell.buildInputs ++ (with packages; [
    jdk21
    gradle
  ]);
  shellHook = ''
    ${baseShell.shellHook}
    echo "Webshop development environment activated"
    echo "  - Java: $(java -version 2>&1 | head -n 1)"
    echo "  - Node.js: $(node --version)"
  '';
}
