"""商品ドメインの Repository インターフェース定義。

ProductRepository, ItemRepository を ABC として定義する。
ドメイン層はこのインターフェースに依存し、
インフラ層（repositories.py）が具体的な実装を提供する。
"""

from abc import ABC, abstractmethod  # noqa: F401
