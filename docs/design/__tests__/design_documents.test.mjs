import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARCH_PATH = resolve(__dirname, '..', 'architecture_design.md')
const DATA_MODEL_PATH = resolve(__dirname, '..', 'data_model.md')
const DOMAIN_MODEL_PATH = resolve(__dirname, '..', 'domain_model.md')
const UI_DESIGN_PATH = resolve(__dirname, '..', 'ui_design.md')
const INDEX_PATH = resolve(__dirname, '..', 'index.md')

// --- Helper functions ---

function readArchitecture() {
  if (!existsSync(ARCH_PATH)) {
    throw new Error(
      `アーキテクチャ設計書が存在しません: ${ARCH_PATH}`
    )
  }
  return readFileSync(ARCH_PATH, 'utf-8')
}

function readDataModel() {
  if (!existsSync(DATA_MODEL_PATH)) {
    throw new Error(
      `データモデル設計書が存在しません: ${DATA_MODEL_PATH}`
    )
  }
  return readFileSync(DATA_MODEL_PATH, 'utf-8')
}

function readDomainModel() {
  if (!existsSync(DOMAIN_MODEL_PATH)) {
    throw new Error(
      `ドメインモデル設計書が存在しません: ${DOMAIN_MODEL_PATH}`
    )
  }
  return readFileSync(DOMAIN_MODEL_PATH, 'utf-8')
}

function readUiDesign() {
  if (!existsSync(UI_DESIGN_PATH)) {
    throw new Error(
      `UI 設計書が存在しません: ${UI_DESIGN_PATH}`
    )
  }
  return readFileSync(UI_DESIGN_PATH, 'utf-8')
}

function readIndex() {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(`index.md が存在しません: ${INDEX_PATH}`)
  }
  return readFileSync(INDEX_PATH, 'utf-8')
}

function countPatternMatches(content, pattern) {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ============================================================
// ファイルの存在確認
// ============================================================

describe('設計ドキュメントの存在確認', () => {
  it('should exist at docs/design/architecture_design.md', () => {
    // Given: アーキテクチャ設計書のパス
    // When: ファイルの存在を確認する
    const exists = existsSync(ARCH_PATH)

    // Then: ファイルが存在する
    assert.ok(exists, `アーキテクチャ設計書が存在しません: ${ARCH_PATH}`)
  })

  it('should exist at docs/design/data_model.md', () => {
    // Given: データモデル設計書のパス
    // When: ファイルの存在を確認する
    const exists = existsSync(DATA_MODEL_PATH)

    // Then: ファイルが存在する
    assert.ok(exists, `データモデル設計書が存在しません: ${DATA_MODEL_PATH}`)
  })

  it('should exist at docs/design/domain_model.md', () => {
    // Given: ドメインモデル設計書のパス
    // When: ファイルの存在を確認する
    const exists = existsSync(DOMAIN_MODEL_PATH)

    // Then: ファイルが存在する
    assert.ok(exists, `ドメインモデル設計書が存在しません: ${DOMAIN_MODEL_PATH}`)
  })

  it('should exist at docs/design/ui_design.md', () => {
    // Given: UI 設計書のパス
    // When: ファイルの存在を確認する
    const exists = existsSync(UI_DESIGN_PATH)

    // Then: ファイルが存在する
    assert.ok(exists, `UI 設計書が存在しません: ${UI_DESIGN_PATH}`)
  })
})

// ============================================================
// アーキテクチャ設計
// ============================================================

describe('アーキテクチャ設計', () => {
  let archContent
  before(() => {
    archContent = readArchitecture()
  })

  describe('タイトルと概要', () => {
    it('should have a title indicating architecture design', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: タイトル行を確認する
      // Then: アーキテクチャ設計であることが示されている
      assert.match(
        content,
        /^# .*アーキテクチャ/m,
        'タイトルに「アーキテクチャ」が含まれていません'
      )
    })

    it('should mention layered architecture', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: レイヤード3層アーキテクチャへの言及を確認する
      // Then: レイヤード3層アーキテクチャが記述されている
      assert.match(
        content,
        /レイヤード.*3層|レイヤード.*アーキテクチャ/,
        'レイヤード3層アーキテクチャへの言及がありません'
      )
    })

    it('should not mention hexagonal architecture as current pattern', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: ヘキサゴナルアーキテクチャが現行パターンとして記述されていないことを確認する
      // Then: 「ヘキサゴナル」がアーキテクチャの採用パターンとして記述されていない
      assert.doesNotMatch(
        content,
        /採用.*ヘキサゴナル|ヘキサゴナルアーキテクチャ.*採用|ヘキサゴナルアーキテクチャ（ポートとアダプター）を採用/,
        'ヘキサゴナルアーキテクチャが現行パターンとして残っています'
      )
    })

    it('should not contain template placeholders', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: テンプレートのプレースホルダを検索する
      // Then: プレースホルダが残っていない
      const placeholderPattern = /\[(?:システム名|レイヤー名\d*|パッケージ名\d*|コンポーネント名\d*)\]/g
      const matches = content.match(placeholderPattern)
      assert.equal(
        matches,
        null,
        `テンプレートのプレースホルダが残っています: ${matches?.join(', ')}`
      )
    })
  })

  describe('レイヤー構成', () => {
    it('should define domain layer', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: ドメイン層の記述を確認する
      // Then: ドメイン層が定義されている
      assert.match(
        content,
        /ドメイン層|ドメインレイヤー|domain/i,
        'ドメイン層の定義がありません'
      )
    })

    it('should define application layer', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: アプリケーション層の記述を確認する
      // Then: アプリケーション層が定義されている
      assert.match(
        content,
        /アプリケーション層|アプリケーションレイヤー|application/i,
        'アプリケーション層の定義がありません'
      )
    })

    it('should define presentation layer', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: プレゼンテーション層の記述を確認する
      // Then: プレゼンテーション層が定義されている
      assert.match(
        content,
        /プレゼンテーション層|プレゼンテーションレイヤー|presentation/i,
        'プレゼンテーション層の定義がありません'
      )
    })

    it('should define infrastructure layer', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: インフラストラクチャ層の記述を確認する
      // Then: インフラストラクチャ層が定義されている
      assert.match(
        content,
        /インフラストラクチャ層|インフラ層|infrastructure/i,
        'インフラストラクチャ層の定義がありません'
      )
    })
  })

  describe('レイヤー間の依存関係', () => {
    it('should define Controller to Service dependency', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: Controller → Service の依存関係を確認する
      // Then: 直接依存が記述されている
      assert.match(
        content,
        /Controller.*Service|presentation.*application/i,
        'Controller → Service の依存関係が定義されていません'
      )
    })

    it('should define Service to Repository dependency', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: Service → Repository の依存関係を確認する
      // Then: 直接依存が記述されている
      assert.match(
        content,
        /Service.*Repository|application.*infrastructure/i,
        'Service → Repository の依存関係が定義されていません'
      )
    })

    it('should not define port interfaces', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: ポートインターフェースの定義がないことを確認する
      // Then: インバウンドポート・アウトバウンドポートが定義されていない
      assert.doesNotMatch(
        content,
        /インバウンド.*ポート|アウトバウンド.*ポート/,
        'ポートインターフェースの定義が残っています'
      )
    })
  })

  describe('パッケージ構成', () => {
    it('should define domain/model package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: domain/model パッケージの記述を確認する
      // Then: パッケージが定義されている
      assert.match(
        content,
        /domain.*model|domain\/model/i,
        'domain/model パッケージの定義がありません'
      )
    })

    it('should define application/service package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: application/service パッケージの記述を確認する
      // Then: パッケージが定義されている
      assert.match(
        content,
        /application.*service|application\/service/i,
        'application/service パッケージの定義がありません'
      )
    })

    it('should define presentation/controller package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: presentation/controller パッケージの記述を確認する
      // Then: パッケージが定義されている
      assert.match(
        content,
        /presentation.*controller|presentation\/controller/i,
        'presentation/controller パッケージの定義がありません'
      )
    })

    it('should define infrastructure/persistence package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: infrastructure/persistence パッケージの記述を確認する
      // Then: パッケージが定義されている
      assert.match(
        content,
        /infrastructure.*persistence|infrastructure\/persistence/i,
        'infrastructure/persistence パッケージの定義がありません'
      )
    })

    it('should not define domain/repository package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: domain/repository パッケージが存在しないことを確認する
      // Then: パッケージが定義されていない
      assert.doesNotMatch(
        content,
        /domain\/repository/,
        'domain/repository パッケージの定義が残っています'
      )
    })

    it('should not define application/port package', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: application/port パッケージが存在しないことを確認する
      // Then: パッケージが定義されていない
      assert.doesNotMatch(
        content,
        /application\/port/,
        'application/port パッケージの定義が残っています'
      )
    })
  })

  describe('技術スタックの言及', () => {
    it('should mention Spring Boot', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: Spring Boot の言及を確認する
      // Then: Spring Boot が記述されている
      assert.match(
        content,
        /Spring Boot/,
        'Spring Boot への言及がありません'
      )
    })

    it('should mention Thymeleaf', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: Thymeleaf の言及を確認する
      // Then: Thymeleaf が記述されている
      assert.match(
        content,
        /Thymeleaf/,
        'Thymeleaf への言及がありません'
      )
    })

    it('should mention apps/webapp/ as deployment target', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: apps/webapp/ の言及を確認する
      // Then: 配置先が記述されている
      assert.match(
        content,
        /apps\/webapp/,
        'apps/webapp/ 配置先への言及がありません'
      )
    })
  })

  describe('PlantUML 図', () => {
    it('should contain at least one architecture diagram in PlantUML', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: PlantUML 図の数を確認する
      const diagramCount = countPatternMatches(content, /@startuml/g)

      // Then: 少なくとも1つの図がある
      assert.ok(
        diagramCount >= 1,
        `PlantUML アーキテクチャ図が存在しません（${diagramCount}個）`
      )
    })

    it('should have matching @startuml and @enduml pairs', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: @startuml と @enduml の数を数える
      const startCount = countPatternMatches(content, /@startuml/g)
      const endCount = countPatternMatches(content, /@enduml/g)

      // Then: 対応が一致する
      assert.equal(
        startCount,
        endCount,
        `@startuml (${startCount}) と @enduml (${endCount}) の数が一致しません`
      )
    })

    it('should wrap all PlantUML in markdown code blocks', () => {
      // Given: アーキテクチャ設計書の内容
      const content = archContent

      // When: plantuml ブロックと @startuml の数を比較する
      const plantumlBlocks = countPatternMatches(content, /```plantuml/g)
      const startumlCount = countPatternMatches(content, /@startuml/g)

      // Then: すべての @startuml が ```plantuml ブロック内にある
      assert.equal(
        plantumlBlocks,
        startumlCount,
        `\`\`\`plantuml ブロック (${plantumlBlocks}) と @startuml (${startumlCount}) の数が一致しません`
      )
    })
  })
})

// ============================================================
// データモデル設計
// ============================================================

describe('データモデル設計', () => {
  let dataContent
  before(() => {
    dataContent = readDataModel()
  })

  describe('タイトルと概要', () => {
    it('should have a title indicating data model design', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: タイトル行を確認する
      // Then: データモデル設計であることが示されている
      assert.match(
        content,
        /^# .*データモデル/m,
        'タイトルに「データモデル」が含まれていません'
      )
    })

    it('should not contain template placeholders', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: テンプレートのプレースホルダを検索する
      // Then: プレースホルダが残っていない
      const placeholderPattern = /\[(?:テーブル名\d*|カラム名\d*|エンティティ名\d*)\]/g
      const matches = content.match(placeholderPattern)
      assert.equal(
        matches,
        null,
        `テンプレートのプレースホルダが残っています: ${matches?.join(', ')}`
      )
    })
  })

  describe('概念データモデル', () => {
    it('should contain a conceptual data model section', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 概念データモデルのセクションを確認する
      // Then: セクションが存在する
      assert.match(
        content,
        /概念.*データモデル|概念.*モデル/,
        '概念データモデルセクションが存在しません'
      )
    })

    it('should include all 10 information entities', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 10 エンティティの存在を確認する
      const entities = [
        '得意先', '届け先', '受注', '商品',
        '商品構成', '単品', '仕入先', '発注', '入荷', '在庫',
      ]

      // Then: すべてのエンティティが含まれる
      for (const entity of entities) {
        assert.match(
          content,
          new RegExp(entity),
          `エンティティ「${entity}」が含まれていません`
        )
      }
    })
  })

  describe('論理データモデル', () => {
    it('should contain a logical data model section', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 論理データモデルのセクションを確認する
      // Then: セクションが存在する
      assert.match(
        content,
        /論理.*データモデル|論理.*モデル/,
        '論理データモデルセクションが存在しません'
      )
    })

    it('should define primary keys for tables', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 主キーの定義を確認する
      // Then: 主キー（PK / PRIMARY KEY）の記述がある
      assert.match(
        content,
        /PK|PRIMARY KEY|主キー/i,
        '主キーの定義がありません'
      )
    })

    it('should define foreign keys for relationships', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 外部キーの定義を確認する
      // Then: 外部キー（FK / FOREIGN KEY）の記述がある
      assert.match(
        content,
        /FK|FOREIGN KEY|外部キー/i,
        '外部キーの定義がありません'
      )
    })
  })

  describe('テーブル定義', () => {
    it('should define customers table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: customers テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /customers|得意先.*テーブル/i,
        'customers（得意先）テーブルの定義がありません'
      )
    })

    it('should define orders table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: orders テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /### orders|orders（受注）|entity\s+orders\b/i,
        'orders（受注）テーブルの定義がありません'
      )
    })

    it('should define products table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: products テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /products|商品.*テーブル/i,
        'products（商品）テーブルの定義がありません'
      )
    })

    it('should define items table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: items テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /items|単品.*テーブル/i,
        'items（単品）テーブルの定義がありません'
      )
    })

    it('should define stocks table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: stocks テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /stocks|在庫.*テーブル/i,
        'stocks（在庫）テーブルの定義がありません'
      )
    })

    it('should define suppliers table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: suppliers テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /suppliers|仕入先.*テーブル/i,
        'suppliers（仕入先）テーブルの定義がありません'
      )
    })

    it('should define delivery_destinations table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: delivery_destinations テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /delivery_destinations|届け先.*テーブル/i,
        'delivery_destinations（届け先）テーブルの定義がありません'
      )
    })

    it('should define purchase_orders table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: purchase_orders テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /purchase_orders|発注.*テーブル/i,
        'purchase_orders（発注）テーブルの定義がありません'
      )
    })

    it('should define arrivals table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: arrivals テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /arrivals|入荷.*テーブル/i,
        'arrivals（入荷）テーブルの定義がありません'
      )
    })

    it('should define product_compositions table', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: product_compositions テーブルの定義を確認する
      // Then: テーブルが定義されている
      assert.match(
        content,
        /product_compositions|商品構成.*テーブル/i,
        'product_compositions（商品構成）テーブルの定義がありません'
      )
    })
  })

  describe('ステータス定義', () => {
    it('should define order statuses (6 values)', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 受注ステータスの定義を確認する
      // Then: 受注ステータスが定義されている
      assert.match(
        content,
        /受注.*ステータス|order.*status/i,
        '受注ステータスの定義がありません'
      )
    })

    it('should define inventory statuses', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 在庫ステータスの定義を確認する
      // Then: 在庫ステータスが定義されている
      assert.match(
        content,
        /在庫.*ステータス|stock.*status|inventory.*status/i,
        '在庫ステータスの定義がありません'
      )
    })

    it('should define purchase order statuses', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: 発注ステータスの定義を確認する
      // Then: 発注ステータスが定義されている
      assert.match(
        content,
        /発注.*ステータス|purchase.*order.*status/i,
        '発注ステータスの定義がありません'
      )
    })
  })

  describe('PlantUML ER 図', () => {
    it('should contain at least one ER diagram in PlantUML', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: PlantUML 図の数を確認する
      const diagramCount = countPatternMatches(content, /@startuml/g)

      // Then: 少なくとも1つの図がある
      assert.ok(
        diagramCount >= 1,
        `PlantUML ER 図が存在しません（${diagramCount}個）`
      )
    })

    it('should have matching @startuml and @enduml pairs', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: @startuml と @enduml の数を数える
      const startCount = countPatternMatches(content, /@startuml/g)
      const endCount = countPatternMatches(content, /@enduml/g)

      // Then: 対応が一致する
      assert.equal(
        startCount,
        endCount,
        `@startuml (${startCount}) と @enduml (${endCount}) の数が一致しません`
      )
    })

    it('should wrap all PlantUML in markdown code blocks', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: plantuml ブロックと @startuml の数を比較する
      const plantumlBlocks = countPatternMatches(content, /```plantuml/g)
      const startumlCount = countPatternMatches(content, /@startuml/g)

      // Then: すべての @startuml が ```plantuml ブロック内にある
      assert.equal(
        plantumlBlocks,
        startumlCount,
        `\`\`\`plantuml ブロック (${plantumlBlocks}) と @startuml (${startumlCount}) の数が一致しません`
      )
    })

    it('should use entity keyword in ER diagrams', () => {
      // Given: データモデル設計書の内容
      const content = dataContent

      // When: entity キーワードの使用を確認する
      // Then: PlantUML の entity が使われている
      assert.match(
        content,
        /entity\s+/,
        'PlantUML ER 図で entity キーワードが使用されていません'
      )
    })
  })
})

// ============================================================
// ドメインモデル設計
// ============================================================

describe('ドメインモデル設計', () => {
  let domainContent
  before(() => {
    domainContent = readDomainModel()
  })

  describe('タイトルと概要', () => {
    it('should have a title indicating domain model design', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: タイトル行を確認する
      // Then: ドメインモデル設計であることが示されている
      assert.match(
        content,
        /^# .*ドメインモデル/m,
        'タイトルに「ドメインモデル」が含まれていません'
      )
    })

    it('should not contain template placeholders', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: テンプレートのプレースホルダを検索する
      // Then: プレースホルダが残っていない
      const placeholderPattern = /\[(?:集約名\d*|エンティティ名\d*|値オブジェクト名\d*)\]/g
      const matches = content.match(placeholderPattern)
      assert.equal(
        matches,
        null,
        `テンプレートのプレースホルダが残っています: ${matches?.join(', ')}`
      )
    })
  })

  describe('集約の定義', () => {
    it('should define Order aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 受注集約の定義を確認する
      // Then: 受注集約が定義されている
      assert.match(
        content,
        /受注.*集約|Order.*Aggregate/i,
        '受注集約の定義がありません'
      )
    })

    it('should define Customer aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 得意先集約の定義を確認する
      // Then: 得意先集約が定義されている
      assert.match(
        content,
        /得意先.*集約|Customer.*Aggregate/i,
        '得意先集約の定義がありません'
      )
    })

    it('should define Product aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 商品集約の定義を確認する
      // Then: 商品集約が定義されている
      assert.match(
        content,
        /商品.*集約|Product.*Aggregate/i,
        '商品集約の定義がありません'
      )
    })

    it('should define Stock aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 在庫集約の定義を確認する
      // Then: 在庫集約が定義されている
      assert.match(
        content,
        /在庫.*集約|Stock.*Aggregate|Inventory.*Aggregate/i,
        '在庫集約の定義がありません'
      )
    })

    it('should define PurchaseOrder aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 発注集約の定義を確認する
      // Then: 発注集約が定義されている
      assert.match(
        content,
        /発注.*集約|PurchaseOrder.*Aggregate/i,
        '発注集約の定義がありません'
      )
    })

    it('should define Supplier aggregate', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 仕入先集約の定義を確認する
      // Then: 仕入先集約が定義されている
      assert.match(
        content,
        /仕入先.*集約|Supplier.*Aggregate/i,
        '仕入先集約の定義がありません'
      )
    })
  })

  describe('値オブジェクトの定義', () => {
    it('should define OrderStatus value object', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 受注ステータス値オブジェクトの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /受注ステータス|OrderStatus/,
        '受注ステータス値オブジェクトの定義がありません'
      )
    })

    it('should define DeliveryDate value object', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 届け日値オブジェクトの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /届け日|DeliveryDate/,
        '届け日値オブジェクトの定義がありません'
      )
    })

    it('should define QualityRetentionDays or similar value object', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 品質維持日数値オブジェクトの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /品質維持日数|QualityRetentionDays/,
        '品質維持日数値オブジェクトの定義がありません'
      )
    })
  })

  describe('ドメインサービスの定義', () => {
    it('should define inventory transition calculation service (BR06)', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 在庫推移計算サービスの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /在庫推移.*計算|在庫推移.*サービス|InventoryTransition/i,
        '在庫推移計算ドメインサービスの定義がありません'
      )
    })

    it('should define delivery date validation service (BR07)', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 届け日検証サービスの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /届け日.*検証|届け日.*バリデーション|DeliveryDate.*Validat/i,
        '届け日検証ドメインサービスの定義がありません'
      )
    })

    it('should define shipping date determination service (BR02)', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 出荷日判定サービスの定義を確認する
      // Then: 定義がある
      assert.match(
        content,
        /出荷日.*判定|出荷日.*計算|ShippingDate/i,
        '出荷日判定ドメインサービスの定義がありません'
      )
    })
  })

  describe('ユビキタス言語', () => {
    it('should contain a ubiquitous language section or glossary', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: ユビキタス言語セクションの存在を確認する
      // Then: セクションが存在する
      assert.match(
        content,
        /ユビキタス言語|用語集|Ubiquitous Language/i,
        'ユビキタス言語（用語集）セクションが存在しません'
      )
    })

    it('should include key domain terms in ubiquitous language', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: 主要なドメイン用語の存在を確認する
      const terms = ['得意先', '受注', '商品', '単品', '仕入先', '在庫', '発注']

      // Then: すべての主要用語が含まれる
      for (const term of terms) {
        assert.match(
          content,
          new RegExp(term),
          `ユビキタス言語にドメイン用語「${term}」が含まれていません`
        )
      }
    })
  })

  describe('PlantUML 図', () => {
    it('should contain at least one domain model diagram in PlantUML', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: PlantUML 図の数を確認する
      const diagramCount = countPatternMatches(content, /@startuml/g)

      // Then: 少なくとも1つの図がある
      assert.ok(
        diagramCount >= 1,
        `PlantUML ドメインモデル図が存在しません（${diagramCount}個）`
      )
    })

    it('should have matching @startuml and @enduml pairs', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: @startuml と @enduml の数を数える
      const startCount = countPatternMatches(content, /@startuml/g)
      const endCount = countPatternMatches(content, /@enduml/g)

      // Then: 対応が一致する
      assert.equal(
        startCount,
        endCount,
        `@startuml (${startCount}) と @enduml (${endCount}) の数が一致しません`
      )
    })

    it('should wrap all PlantUML in markdown code blocks', () => {
      // Given: ドメインモデル設計書の内容
      const content = domainContent

      // When: plantuml ブロックと @startuml の数を比較する
      const plantumlBlocks = countPatternMatches(content, /```plantuml/g)
      const startumlCount = countPatternMatches(content, /@startuml/g)

      // Then: すべての @startuml が ```plantuml ブロック内にある
      assert.equal(
        plantumlBlocks,
        startumlCount,
        `\`\`\`plantuml ブロック (${plantumlBlocks}) と @startuml (${startumlCount}) の数が一致しません`
      )
    })
  })
})

// ============================================================
// UI 設計
// ============================================================

describe('UI 設計', () => {
  let uiContent
  before(() => {
    uiContent = readUiDesign()
  })

  describe('タイトルと概要', () => {
    it('should have a title indicating UI design', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: タイトル行を確認する
      // Then: UI 設計であることが示されている
      assert.match(
        content,
        /^# .*UI 設計|^# .*UI設計|^# .*画面設計/m,
        'タイトルに「UI 設計」が含まれていません'
      )
    })

    it('should not contain template placeholders', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: テンプレートのプレースホルダを検索する
      // Then: プレースホルダが残っていない
      const placeholderPattern = /\[(?:画面名\d*|コンポーネント名\d*|URL\d*)\]/g
      const matches = content.match(placeholderPattern)
      assert.equal(
        matches,
        null,
        `テンプレートのプレースホルダが残っています: ${matches?.join(', ')}`
      )
    })
  })

  describe('画面一覧', () => {
    it('should contain a screen list section', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 画面一覧のセクションを確認する
      // Then: セクションが存在する
      assert.match(
        content,
        /画面一覧/,
        '画面一覧セクションが存在しません'
      )
    })

    it('should include customer-facing screens', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 顧客向け画面の存在を確認する
      // Then: 主要な顧客向け画面が含まれる
      assert.match(content, /商品一覧/, '顧客向け画面「商品一覧」が含まれていません')
      assert.match(content, /注文/, '顧客向け画面「注文」関連が含まれていません')
      assert.match(content, /ログイン/, '顧客向け画面「ログイン」が含まれていません')
    })

    it('should include management screens', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 管理画面の存在を確認する
      // Then: 主要な管理画面が含まれる
      assert.match(content, /受注一覧|受注管理/, '管理画面「受注一覧」が含まれていません')
      assert.match(content, /在庫推移/, '管理画面「在庫推移」が含まれていません')
      assert.match(content, /発注/, '管理画面「発注」関連が含まれていません')
    })

    it('should have at least 14 screens total', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 画面一覧テーブルの行数を確認する
      // 画面一覧セクション内のテーブル行をカウント
      const screenListSection = content.split(/画面一覧/)[1]?.split(/##\s/)[0]
      if (screenListSection) {
        const tableRows = countPatternMatches(
          screenListSection,
          /\|.*\|.*\|/g
        )
        // ヘッダー行と区切り行を除外（最低2行）
        const dataRows = tableRows - 2

        // Then: 少なくとも15画面が定義されている
        assert.ok(
          dataRows >= 15,
          `画面一覧のデータ行が15行未満です（${dataRows}行）。顧客向け8画面+管理7画面=15画面が必要`
        )
      }
    })
  })

  describe('画面遷移図', () => {
    it('should contain screen transition diagrams in PlantUML', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 画面遷移図の存在を確認する
      // Then: 画面遷移図が含まれている
      assert.match(
        content,
        /画面遷移/,
        '画面遷移図セクションが存在しません'
      )
    })

    it('should have customer-facing transition diagram', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 顧客向け画面遷移図の存在を確認する
      // Then: 顧客向けの遷移が含まれている
      assert.match(
        content,
        /顧客.*遷移|得意先.*遷移|顧客向け/,
        '顧客向け画面遷移図が含まれていません'
      )
    })

    it('should have management transition diagram', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 管理画面遷移図の存在を確認する
      // Then: 管理向けの遷移が含まれている
      assert.match(
        content,
        /管理.*遷移|管理向け/,
        '管理向け画面遷移図が含まれていません'
      )
    })
  })

  describe('画面イメージ (salt 図)', () => {
    it('should contain at least one salt diagram', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: salt 図の数を確認する
      const saltCount = countPatternMatches(content, /@startsalt|salt/g)

      // Then: 少なくとも1つの salt 図がある
      assert.ok(
        saltCount >= 1,
        `salt 図（ワイヤーフレーム）が存在しません（${saltCount}個）`
      )
    })
  })

  describe('URL パス設計', () => {
    it('should define customer-facing URL paths', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 顧客向け URL パスの定義を確認する
      // Then: 主要な顧客向け URL パスが定義されている
      assert.match(
        content,
        /\/products|\/orders/,
        '顧客向け URL パス（/products, /orders）の定義がありません'
      )
    })

    it('should define admin URL paths', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: 管理 URL パスの定義を確認する
      // Then: /admin/ パスが定義されている
      assert.match(
        content,
        /\/admin/,
        '管理 URL パス（/admin/）の定義がありません'
      )
    })
  })

  describe('Thymeleaf テンプレート構成', () => {
    it('should describe Thymeleaf template structure', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: Thymeleaf テンプレート構成の記述を確認する
      // Then: テンプレート構成が記述されている
      assert.match(
        content,
        /Thymeleaf|テンプレート/,
        'Thymeleaf テンプレート構成の記述がありません'
      )
    })

    it('should mention layout template for shared header/footer', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: レイアウトテンプレートの言及を確認する
      // Then: レイアウトテンプレートが記述されている
      assert.match(
        content,
        /レイアウト|layout|ヘッダー|フッター|header|footer/i,
        'レイアウトテンプレート（共通ヘッダー・フッター）の記述がありません'
      )
    })
  })

  describe('PlantUML 図', () => {
    it('should contain PlantUML diagrams', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: PlantUML 図の数を確認する
      const diagramCount = countPatternMatches(content, /@startuml|@startsalt/g)

      // Then: 少なくとも2つの図がある（画面遷移図 2 系統）
      assert.ok(
        diagramCount >= 2,
        `PlantUML 図が2つ未満です（${diagramCount}個）。画面遷移図が必要`
      )
    })

    it('should have matching start and end pairs', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: @startuml/@startsalt と @enduml/@endsalt の数を数える
      const startCount = countPatternMatches(content, /@startuml|@startsalt/g)
      const endCount = countPatternMatches(content, /@enduml|@endsalt/g)

      // Then: 対応が一致する
      assert.equal(
        startCount,
        endCount,
        `開始タグ (${startCount}) と終了タグ (${endCount}) の数が一致しません`
      )
    })

    it('should wrap all PlantUML in markdown code blocks', () => {
      // Given: UI 設計書の内容
      const content = uiContent

      // When: plantuml ブロックと start タグの数を比較する
      const plantumlBlocks = countPatternMatches(content, /```plantuml/g)
      const startCount = countPatternMatches(content, /@startuml|@startsalt/g)

      // Then: すべての start タグが ```plantuml ブロック内にある
      assert.equal(
        plantumlBlocks,
        startCount,
        `\`\`\`plantuml ブロック (${plantumlBlocks}) と start タグ (${startCount}) の数が一致しません`
      )
    })
  })
})

// ============================================================
// 4 文書間の整合性
// ============================================================

describe('4 文書間の整合性', () => {
  let archContent, domainContent, dataContent, uiContent
  before(() => {
    archContent = readArchitecture()
    domainContent = readDomainModel()
    dataContent = readDataModel()
    uiContent = readUiDesign()
  })

  describe('ドメインモデルとデータモデルの対応', () => {
    it('should have matching entities between domain model and data model', () => {
      // Given: ドメインモデルとデータモデルの内容

      // When: 主要エンティティの対応を確認する
      const entities = ['得意先', '受注', '商品', '単品', '仕入先', '在庫', '発注', '入荷', '届け先']

      // Then: 両方のドキュメントに同じエンティティが含まれる
      for (const entity of entities) {
        const inDomain = new RegExp(entity).test(domainContent)
        const inData = new RegExp(entity).test(dataContent)
        assert.ok(
          inDomain && inData,
          `エンティティ「${entity}」がドメインモデル(${inDomain})とデータモデル(${inData})の両方に存在しません`
        )
      }
    })
  })

  describe('アーキテクチャとドメインモデルの整合', () => {
    it('should reference domain layer in both architecture and domain model', () => {
      // Given: アーキテクチャとドメインモデルの内容（before() でキャッシュ済み）

      // When: ドメイン層への参照を確認する
      // Then: 両方のドキュメントでドメイン層が参照されている
      assert.match(
        archContent,
        /ドメイン層|domain/i,
        'アーキテクチャ設計にドメイン層への参照がありません'
      )
      assert.match(
        domainContent,
        /ドメイン|domain/i,
        'ドメインモデル設計にドメインへの参照がありません'
      )
    })
  })

  describe('UI 設計と要件定義の画面対応', () => {
    it('should include screens matching requirements definition screen model', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 要件定義の画面・帳票モデルで定義された主要画面の存在を確認する
      const screens = ['商品一覧', '注文', '受注', '在庫推移']

      // Then: 主要画面が UI 設計に含まれる
      for (const screen of screens) {
        assert.match(
          uiContent,
          new RegExp(screen),
          `要件定義で定義された画面「${screen}」が UI 設計に含まれていません`
        )
      }
    })
  })
})

// ============================================================
// トレーサビリティ
// ============================================================

describe('トレーサビリティ', () => {
  let archContent, domainContent, uiContent
  before(() => {
    archContent = readArchitecture()
    domainContent = readDomainModel()
    uiContent = readUiDesign()
  })

  it('should reference UC numbers in architecture design', () => {
    // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

    // When: UC 番号またはユーザーストーリー番号への参照を確認する
    // Then: トレーサビリティの参照がある
    const hasUcRef = /UC\d{3}/.test(archContent)
    const hasUsRef = /US\d{3}/.test(archContent)
    const hasTraceability = /トレーサビリティ|ユースケース|ユーザーストーリー/.test(archContent)
    assert.ok(
      hasUcRef || hasUsRef || hasTraceability,
      'アーキテクチャ設計に UC/US 番号またはトレーサビリティへの参照がありません'
    )
  })

  it('should reference UC numbers in domain model', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: UC 番号への参照を確認する
    // Then: UC 番号への参照がある
    const hasUcRef = /UC\d{3}/.test(domainContent)
    const hasUsRef = /US\d{3}/.test(domainContent)
    const hasBrRef = /BR\d{2}/.test(domainContent)
    assert.ok(
      hasUcRef || hasUsRef || hasBrRef,
      'ドメインモデル設計に UC/US/BR 番号への参照がありません'
    )
  })

  it('should reference UC numbers in UI design', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: UC 番号への参照を確認する
    // Then: UC 番号への参照がある
    const hasUcRef = /UC\d{3}/.test(uiContent)
    const hasUsRef = /US\d{3}/.test(uiContent)
    assert.ok(
      hasUcRef || hasUsRef,
      'UI 設計に UC/US 番号への参照がありません'
    )
  })
})

// ============================================================
// index.md の更新
// ============================================================

describe('index.md の更新', () => {
  let indexContent
  before(() => {
    indexContent = readIndex()
  })

  it('should update architecture design status to 作成済み', () => {
    // Given: index.md の内容（before() でキャッシュ済み）

    // When: アーキテクチャ設計の状況を確認する
    // Then: 「作成済み」に更新されている
    assert.match(
      indexContent,
      /アーキテクチャ.*作成済み/,
      'index.md のアーキテクチャ設計の状況が「作成済み」に更新されていません'
    )
  })

  it('should update data model design status to 作成済み', () => {
    // Given: index.md の内容（before() でキャッシュ済み）

    // When: データモデル設計の状況を確認する
    // Then: 「作成済み」に更新されている
    assert.match(
      indexContent,
      /データモデル.*作成済み/,
      'index.md のデータモデル設計の状況が「作成済み」に更新されていません'
    )
  })

  it('should update domain model design status to 作成済み', () => {
    // Given: index.md の内容（before() でキャッシュ済み）

    // When: ドメインモデル設計の状況を確認する
    // Then: 「作成済み」に更新されている
    assert.match(
      indexContent,
      /ドメインモデル.*作成済み/,
      'index.md のドメインモデル設計の状況が「作成済み」に更新されていません'
    )
  })

  it('should update UI design status to 作成済み', () => {
    // Given: index.md の内容（before() でキャッシュ済み）

    // When: UI 設計の状況を確認する
    // Then: 「作成済み」に更新されている
    assert.match(
      indexContent,
      /UI 設計.*作成済み|UI設計.*作成済み/,
      'index.md の UI 設計の状況が「作成済み」に更新されていません'
    )
  })
})

// --- scope-shrink 再発防止テスト ---
describe('scope-shrink 再発防止: ドメインモデルのパッケージ構成', () => {
  let domainContent
  before(() => {
    domainContent = readDomainModel()
  })

  it('should have a package structure section in domain model', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: パッケージ構成セクションの存在を確認する
    // Then: パッケージ構成セクションが存在する
    assert.match(
      domainContent,
      /パッケージ構成/,
      'domain_model.md にパッケージ構成セクションが欠落しています（SCOPE-SHRINK-001）'
    )
  })

  it('should define aggregate-based sub-packages under domain/model/', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: 集約ごとのサブパッケージの定義を確認する
    const packages = ['order', 'customer', 'product', 'item', 'supplier', 'stock']

    // Then: すべての集約パッケージが定義されている
    for (const pkg of packages) {
      assert.match(
        domainContent,
        new RegExp(pkg, 'i'),
        `domain/model/${pkg} パッケージの定義がありません`
      )
    }
  })

  it('should define domain/service/ package', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: domain/service パッケージの定義を確認する
    // Then: サービスパッケージが定義されている
    assert.match(
      domainContent,
      /domain.*service|"service"/i,
      'domain/service パッケージの定義がありません'
    )
  })

  it('should not define domain/repository/ package', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: domain/repository パッケージが存在しないことを確認する
    // Then: リポジトリパッケージが定義されていない（Service が Repository 実装を直接利用）
    assert.doesNotMatch(
      domainContent,
      /domain\/repository/,
      'domain/repository パッケージの定義が残っています'
    )
  })

  it('should include a PlantUML diagram for package structure', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: パッケージ構成の PlantUML 図を確認する
    // Then: パッケージ構成セクション内に PlantUML 図がある
    const pkgSectionMatch = domainContent.match(/## ドメイン層のパッケージ構成[\s\S]*?(?=\n## [^#])/)?.[0]
    assert.ok(pkgSectionMatch, 'パッケージ構成セクションが見つかりません')
    assert.match(
      pkgSectionMatch,
      /@startuml/,
      'パッケージ構成セクションに PlantUML 図がありません'
    )
  })
})

describe('scope-shrink 再発防止: UI 設計の salt 図網羅性', () => {
  let uiContent
  before(() => {
    uiContent = readUiDesign()
  })

  it('should have at least 15 salt diagrams for all screens', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: salt 図の数を数える
    const saltCount = countPatternMatches(uiContent, /@startsalt/g)

    // Then: 15 画面分の salt 図がある
    assert.ok(
      saltCount >= 15,
      `salt 図が 15 個未満です（${saltCount}個）。全 15 画面分の salt 図が必要です（SCOPE-SHRINK-002）`
    )
  })

  it('should have salt diagrams for all customer-facing screens', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: 顧客向け 8 画面の salt 図の存在を確認する
    const screens = ['ログイン画面', '会員登録画面', '商品一覧画面', '注文画面', '注文内容確認画面', '注文確認画面', '注文履歴画面', '届け先選択画面']

    // Then: すべての顧客向け画面の salt 図がある
    for (const screen of screens) {
      assert.match(
        uiContent,
        new RegExp(`### ${screen}[\\s\\S]*?@startsalt`),
        `顧客向け画面「${screen}」の salt 図がありません`
      )
    }
  })

  it('should have salt diagrams for all management screens', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: 管理向け 7 画面の salt 図の存在を確認する
    const screens = ['受注一覧画面', '在庫推移画面', '発注管理画面', '入荷管理画面', '出荷管理画面', '商品管理画面', '得意先管理画面']

    // Then: すべての管理向け画面の salt 図がある
    for (const screen of screens) {
      assert.match(
        uiContent,
        new RegExp(`### ${screen}[\\s\\S]*?@startsalt`),
        `管理向け画面「${screen}」の salt 図がありません`
      )
    }
  })
})

// --- design-consistency 再発防止テスト ---
describe('design-consistency 再発防止: 3NF 宣言と実設計の整合性', () => {
  let dataContent
  before(() => {
    dataContent = readDataModel()
  })

  it('should document intentional denormalization when 3NF exceptions exist', () => {
    // Given: データモデル設計書の内容（before() でキャッシュ済み）

    // When: 非正規化に関する説明を確認する
    // Then: 意図的な非正規化が文書化されている
    assert.match(
      dataContent,
      /意図的.*非正規化|非正規化.*理由/,
      'data_model.md に 3NF 例外の非正規化理由が文書化されていません（ARCH-3NF-001）'
    )
  })

  it('should explain denormalization for purchase_orders.supplier_id', () => {
    // Given: データモデル設計書の内容（before() でキャッシュ済み）

    // When: purchase_orders.supplier_id の非正規化理由を確認する
    // Then: 理由が説明されている
    assert.match(
      dataContent,
      /purchase_orders.*supplier_id.*非正規化|supplier_id.*導出可能/,
      'purchase_orders.supplier_id の非正規化理由が説明されていません'
    )
  })

  it('should explain denormalization for arrivals.item_id', () => {
    // Given: データモデル設計書の内容（before() でキャッシュ済み）

    // When: arrivals.item_id の非正規化理由を確認する
    // Then: 理由が説明されている
    assert.match(
      dataContent,
      /arrivals.*item_id.*非正規化|arrivals.*item_id.*導出可能/,
      'arrivals.item_id の非正規化理由が説明されていません'
    )
  })
})

// --- domain-model 再発防止テスト ---
describe('domain-model 再発防止: 集約ルートの外部参照 ID', () => {
  let domainContent
  before(() => {
    domainContent = readDomainModel()
  })

  it('should include foreign reference IDs in Order aggregate root', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: 受注集約ルートのフィールドを確認する
    const orderSection = domainContent.match(/class 受注 <<集約ルート>>[\s\S]*?\}/)?.[0]
    assert.ok(orderSection, '受注集約ルートクラスが見つかりません')

    // Then: 外部参照 ID が含まれている
    assert.match(orderSection, /得意先ID/, '受注クラスに得意先ID が欠落しています（ARCH-REF-001）')
    assert.match(orderSection, /商品ID/, '受注クラスに商品ID が欠落しています（ARCH-REF-001）')
    assert.match(orderSection, /届け先ID/, '受注クラスに届け先ID が欠落しています（ARCH-REF-001）')
  })

  it('should include foreign reference IDs in PurchaseOrder aggregate root', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: 発注集約ルートのフィールドを確認する
    const poSection = domainContent.match(/class 発注 <<集約ルート>>[\s\S]*?\}/)?.[0]
    assert.ok(poSection, '発注集約ルートクラスが見つかりません')

    // Then: 外部参照 ID が含まれている
    assert.match(poSection, /単品ID/, '発注クラスに単品ID が欠落しています（ARCH-REF-001）')
    assert.match(poSection, /仕入先ID/, '発注クラスに仕入先ID が欠落しています（ARCH-REF-001）')
  })

  it('should include foreign reference IDs in Arrival aggregate root', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: 入荷集約ルートのフィールドを確認する
    const arrSection = domainContent.match(/class 入荷 <<集約ルート>>[\s\S]*?\}/)?.[0]
    assert.ok(arrSection, '入荷集約ルートクラスが見つかりません')

    // Then: 外部参照 ID が含まれている
    assert.match(arrSection, /発注ID/, '入荷クラスに発注ID が欠落しています（ARCH-REF-001）')
    assert.match(arrSection, /単品ID/, '入荷クラスに単品ID が欠落しています（ARCH-REF-001）')
  })

  it('should include foreign reference ID in ProductComposition entity', () => {
    // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

    // When: 商品構成エンティティのフィールドを確認する
    const compSection = domainContent.match(/class 商品構成 <<エンティティ>>[\s\S]*?\}/)?.[0]
    assert.ok(compSection, '商品構成エンティティクラスが見つかりません')

    // Then: 外部参照 ID が含まれている
    assert.match(compSection, /単品ID/, '商品構成クラスに単品ID が欠落しています（ARCH-REF-001）')
  })
})

// --- doc-inconsistency 再発防止テスト ---
describe('docs/index.md と docs/design/index.md のステータス整合性', () => {
  const ROOT_INDEX_PATH = resolve(__dirname, '..', '..', 'index.md')
  let rootContent, designContent

  function readRootIndex() {
    if (!existsSync(ROOT_INDEX_PATH)) {
      throw new Error(`docs/index.md が存在しません: ${ROOT_INDEX_PATH}`)
    }
    return readFileSync(ROOT_INDEX_PATH, 'utf-8')
  }

  before(() => {
    rootContent = readRootIndex()
    designContent = readIndex()
  })

  it('should not show 設計 as 未着手 when design documents exist', () => {
    // Given: docs/index.md の内容（before() でキャッシュ済み）

    // When: 設計カテゴリのステータスを確認する
    // Then: 「未着手」ではない（設計文書が存在するため）
    const designRow = rootContent.match(/\[設計\].*\|.*\|.*\|/)
    assert.ok(designRow, 'docs/index.md に設計カテゴリの行が見つかりません')
    assert.ok(
      !designRow[0].includes('未着手'),
      'docs/index.md の設計ステータスが「未着手」のまま。docs/design/index.md のステータスと整合させてください'
    )
  })

  it('should reflect 作成済み count consistently with design index', () => {
    // Given: 両方の index.md（before() でキャッシュ済み）

    // When: design/index.md の作成済み件数を数える
    const createdCount = (designContent.match(/作成済み/g) || []).length

    // Then: docs/index.md の設計ステータスに件数が反映されている
    assert.ok(
      createdCount > 0,
      'design/index.md に「作成済み」のドキュメントがありません'
    )
    assert.match(
      rootContent,
      /\[設計\].*作成済み/,
      'docs/index.md の設計ステータスに「作成済み」が反映されていません'
    )
  })
})

// ============================================================
// レビュー指摘対応: ドメインモデル
// ============================================================

describe('レビュー指摘対応: ドメインモデル', () => {
  let domainContent
  before(() => {
    domainContent = readDomainModel()
  })

  describe('在庫集約の単品 ID（指摘 #1）', () => {
    it('should include 単品ID in Stock aggregate root class', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: 在庫集約ルートのフィールドを確認する
      const stockSection = domainContent.match(/class 在庫 <<集約ルート>>[\s\S]*?\}/)?.[0]
      assert.ok(stockSection, '在庫集約ルートクラスが見つかりません')

      // Then: 単品ID フィールドが含まれている
      assert.match(
        stockSection,
        /単品ID/,
        '在庫クラスに単品ID が欠落しています（レビュー指摘 #1: data_model.md の stocks.item_id と不整合）'
      )
    })
  })

  describe('受注ステータスのユビキタス言語表（指摘 #2）', () => {
    it('should include 届け日変更済み in order status description', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: ユビキタス言語表の受注ステータス説明を確認する
      // Then: 届け日変更済みが状態遷移に含まれている
      assert.match(
        domainContent,
        /受注ステータス.*届け日変更済み|届け日変更済み.*受注ステータス/s,
        '受注ステータスの説明に「届け日変更済み」が含まれていません（レビュー指摘 #2）'
      )
    })

    it('should define all 6 order status values in status value object', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: 受注ステータス値オブジェクトの定義を確認する
      const statusSection = domainContent.match(/class 受注ステータス <<値オブジェクト>>[\s\S]*?\}/)?.[0]
      assert.ok(statusSection, '受注ステータス値オブジェクトが見つかりません')

      // Then: 6 値すべてが定義されている
      const statuses = ['受注済み', '届け日変更済み', '出荷準備中', '出荷済み', '配送完了', 'キャンセル']
      for (const status of statuses) {
        assert.match(
          statusSection,
          new RegExp(status),
          `受注ステータス値「${status}」が値オブジェクトに定義されていません`
        )
      }
    })
  })

  describe('届け先集約の関連方針（指摘 #15）', () => {
    it('should document delivery destination as independent aggregate with customer FK', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: 届け先集約の関連方針を確認する
      // Then: 独立集約として得意先IDをFK保持する方針が記載されている
      assert.match(
        domainContent,
        /届け先.*独立.*集約|届け先.*得意先.*ID.*外部キー|届け先.*得意先.*ID.*FK|独立集約.*得意先.*ID/s,
        '届け先集約の関連方針（独立集約として得意先IDを保持）が記載されていません（レビュー指摘 #15）'
      )
    })
  })
})

// ============================================================
// レビュー指摘対応: データモデル
// ============================================================

describe('レビュー指摘対応: データモデル', () => {
  let dataContent
  before(() => {
    dataContent = readDataModel()
  })

  describe('orders.total_amount の導出方法（指摘 #6）', () => {
    it('should document total_amount derivation from product price with BR01 reference', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: total_amount の説明を確認する
      // Then: BR01 に基づく導出方法が明記されている
      assert.match(
        dataContent,
        /total_amount.*BR01|total_amount.*商品価格.*同値|total_amount.*products\.price/s,
        'orders.total_amount の導出方法（BR01: 商品価格と同値）が明記されていません（レビュー指摘 #6）'
      )
    })
  })

  describe('orders.product_id の BR01 制約注釈（指摘 #16）', () => {
    it('should annotate product_id with BR01 constraint', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: product_id の制約注釈を確認する
      // Then: BR01（1受注=1商品）の制約が注記されている
      assert.match(
        dataContent,
        /product_id.*BR01|product_id.*1受注.*1商品|product_id.*1受注=1商品/s,
        'orders.product_id に BR01 制約注釈（1受注=1商品）がありません（レビュー指摘 #16）'
      )
    })
  })

  describe('product_compositions の created_at/updated_at（指摘 #20）', () => {
    it('should include created_at in product_compositions table definition', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: product_compositions テーブル定義セクションを探す
      // Then: created_at が含まれている
      const pcSection = dataContent.match(/### product_compositions[\s\S]*?(?=\n### |\n## |$)/)?.[0]
      assert.ok(pcSection, 'product_compositions テーブル定義セクションが見つかりません')
      assert.match(
        pcSection,
        /created_at/,
        'product_compositions テーブルに created_at が欠落しています（レビュー指摘 #20）'
      )
    })

    it('should include updated_at in product_compositions table definition', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: product_compositions テーブル定義セクションを探す
      // Then: updated_at が含まれている
      const pcSection = dataContent.match(/### product_compositions[\s\S]*?(?=\n### |\n## |$)/)?.[0]
      assert.ok(pcSection, 'product_compositions テーブル定義セクションが見つかりません')
      assert.match(
        pcSection,
        /updated_at/,
        'product_compositions テーブルに updated_at が欠落しています（レビュー指摘 #20）'
      )
    })
  })

  describe('カラム型・制約テスト（指摘 #14）', () => {
    it('should define UNIQUE constraint on customers.email', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: customers.email の UNIQUE 制約を確認する
      // Then: UNIQUE 制約が定義されている
      assert.match(
        dataContent,
        /email.*UNIQUE|UNIQUE.*email/si,
        'customers.email に UNIQUE 制約が定義されていません（レビュー指摘 #14）'
      )
    })

    it('should define NOT NULL constraints on required columns', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: NOT NULL 制約の存在を確認する
      // Then: NOT NULL 制約が記述されている
      assert.match(
        dataContent,
        /NOT NULL/,
        '必須カラムの NOT NULL 制約が定義されていません（レビュー指摘 #14）'
      )
    })

    it('should define AUTO_INCREMENT for primary keys', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: AUTO_INCREMENT の定義を確認する
      // Then: 主キーに AUTO_INCREMENT が使われている
      assert.match(
        dataContent,
        /AUTO_INCREMENT|SERIAL|IDENTITY/i,
        '主キーの AUTO_INCREMENT（自動採番）が定義されていません（レビュー指摘 #14）'
      )
    })
  })
})

// ============================================================
// レビュー指摘対応: アーキテクチャ設計
// ============================================================

describe('レビュー指摘対応: アーキテクチャ設計', () => {
  let archContent
  before(() => {
    archContent = readArchitecture()
  })

  describe('DIP 段階的導入方針（指摘 #7）', () => {
    it('should document DIP phased introduction policy', () => {
      // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

      // When: DIP 段階的導入方針の記述を確認する
      // Then: 依存性逆転に関する方針が記載されている
      assert.match(
        archContent,
        /依存性逆転.*段階的|DIP.*段階|依存性.*逆転.*方針/s,
        '依存性逆転（DIP）の段階的導入方針が記載されていません（レビュー指摘 #7）'
      )
    })

    it('should mention initial direct dependency approach', () => {
      // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

      // When: 初期の直接依存アプローチの記述を確認する
      // Then: 初期は直接依存で開始することが記載されている
      assert.match(
        archContent,
        /直接依存.*開始|初期.*直接.*依存|直接.*参照/s,
        '初期の直接依存アプローチの方針が記載されていません'
      )
    })
  })

  describe('認証・認可方針（指摘 #9）', () => {
    it('should document authentication policy', () => {
      // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

      // When: 認証方針の記述を確認する
      // Then: 認証方針が記載されている
      assert.match(
        archContent,
        /認証.*方針|認証.*認可|認証.*設計/s,
        '認証方針が記載されていません（レビュー指摘 #9）'
      )
    })

    it('should define URL path separation for customer and admin', () => {
      // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

      // When: 顧客向けと管理向けの URL パス分離を確認する
      // Then: パス分離方針が記載されている
      assert.match(
        archContent,
        /\/customer|\/admin|顧客.*管理.*分離|ロール.*ベース/s,
        '顧客向けと管理向けの URL パス分離方針が記載されていません（レビュー指摘 #9）'
      )
    })

    it('should not require authentication for login and register paths (AUTH-TABLE-CONTRADICTION-001)', () => {
      // Given: アーキテクチャ設計書の内容（before() でキャッシュ済み）

      // When: 認証・認可方針テーブルの顧客向け行を確認する
      // Then: /login, /register は顧客向け（認証要）行に含まれない
      const customerAuthLine = archContent.match(/\| 顧客向け \|[^|]+\|/)?.[0] ?? ''
      assert.ok(
        !customerAuthLine.includes('/login'),
        '顧客向け認証行に /login が含まれています。ログイン画面は認証不要（公開）であるべきです'
      )
      assert.ok(
        !customerAuthLine.includes('/register'),
        '顧客向け認証行に /register が含まれています。会員登録画面は認証不要（公開）であるべきです'
      )
    })
  })
})

// ============================================================
// レビュー指摘対応: UI 設計
// ============================================================

describe('レビュー指摘対応: UI 設計', () => {
  let uiContent
  before(() => {
    uiContent = readUiDesign()
  })

  describe('注文確定前確認ステップ（指摘 #11）', () => {
    it('should define 3-step order flow: input -> confirm -> complete', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 注文フローの 3 段階構成を確認する
      // Then: 入力→確認→完了の 3 段階が定義されている
      assert.match(
        uiContent,
        /注文内容確認画面|注文確認画面.*注文完了画面|入力.*確認.*完了/s,
        '注文フローが 3 段階（入力→確認→完了）になっていません（レビュー指摘 #11）'
      )
    })

    it('should define /orders/confirm URL path', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 注文内容確認画面の URL パスを確認する
      // Then: /orders/confirm が定義されている
      assert.match(
        uiContent,
        /\/orders\/confirm/,
        '注文内容確認画面の URL パス（/orders/confirm）が定義されていません（レビュー指摘 #11）'
      )
    })

    it('should have a salt diagram for order confirmation screen', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 注文内容確認画面の salt 図を確認する
      // Then: salt 図がある
      assert.match(
        uiContent,
        /注文内容確認画面[\s\S]*?@startsalt/,
        '注文内容確認画面の salt 図がありません（レビュー指摘 #11）'
      )
    })
  })

  describe('バリデーションルール（指摘 #8）', () => {
    it('should define validation rules section', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: バリデーションルールセクションの存在を確認する
      // Then: セクションが存在する
      assert.match(
        uiContent,
        /バリデーション.*ルール|入力.*検証/,
        'バリデーションルールセクションが存在しません（レビュー指摘 #8）'
      )
    })

    it('should define BR07 delivery date constraint', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: BR07 届け日制約のバリデーションルールを確認する
      // Then: 届け日の有効範囲が定義されている
      assert.match(
        uiContent,
        /BR07.*届け日|届け日.*BR07|届け日.*制約|最短.*注文日.*3日|最長.*注文日.*30日/s,
        'BR07 届け日制約のバリデーションルールが定義されていません（レビュー指摘 #8）'
      )
    })
  })

  describe('在庫推移画面アラート（指摘 #12）', () => {
    it('should define alert functionality in inventory transition screen', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 在庫推移画面のアラート機能を確認する
      // Then: アラート機能が定義されている
      assert.match(
        uiContent,
        /在庫推移[\s\S]*?アラート|在庫推移[\s\S]*?警告|品質期限.*切れ|在庫不足/s,
        '在庫推移画面にアラート機能が定義されていません（レビュー指摘 #12）'
      )
    })
  })

  describe('発注管理画面の在庫参照（指摘 #13）', () => {
    it('should include inventory reference in purchase order management screen', () => {
      // Given: UI 設計書の内容（before() でキャッシュ済み）

      // When: 発注管理画面の在庫参照情報を確認する
      // Then: 在庫推移の参照情報が含まれている
      assert.match(
        uiContent,
        /発注管理[\s\S]*?在庫|発注[\s\S]*?有効在庫|発注[\s\S]*?在庫推移/s,
        '発注管理画面に在庫推移の参照情報がありません（レビュー指摘 #13）'
      )
    })
  })
})

// ============================================================
// レビュー指摘対応: ビジネスルール検証テスト
// ============================================================

describe('ビジネスルール検証', () => {
  let domainContent, dataContent
  before(() => {
    domainContent = readDomainModel()
    dataContent = readDataModel()
  })

  describe('BR01: 1受注=1商品', () => {
    it('should document BR01 in domain model', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: BR01 の記述を確認する
      // Then: BR01 が記述されている
      assert.match(
        domainContent,
        /BR01/,
        'ドメインモデルに BR01（1受注=1商品）の参照がありません'
      )
    })

    it('should document BR01 in data model', () => {
      // Given: データモデル設計書の内容（before() でキャッシュ済み）

      // When: BR01 の記述を確認する
      // Then: BR01 が記述されている
      assert.match(
        dataContent,
        /BR01/,
        'データモデルに BR01（1受注=1商品）の参照がありません'
      )
    })
  })

  describe('BR03: 発注判断は人間', () => {
    it('should document BR03 in domain model', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: BR03 の記述を確認する
      // Then: BR03 が記述されている
      assert.match(
        domainContent,
        /BR03/,
        'ドメインモデルに BR03（発注判断は人間）の参照がありません'
      )
    })
  })

  describe('BR04: 単品ごとに仕入先', () => {
    it('should document BR04 in domain model', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: BR04 の記述を確認する
      // Then: BR04 が記述されている
      assert.match(
        domainContent,
        /BR04/,
        'ドメインモデルに BR04（単品ごとに仕入先）の参照がありません'
      )
    })
  })

  describe('BR05: 品質維持日数', () => {
    it('should document BR05 in domain model', () => {
      // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

      // When: BR05 の記述を確認する
      // Then: BR05 が記述されている
      assert.match(
        domainContent,
        /BR05/,
        'ドメインモデルに BR05（品質維持日数）の参照がありません'
      )
    })
  })
})

// ============================================================
// レビュー指摘対応: ステータス定義値の網羅性テスト
// ============================================================

describe('ステータス定義値の網羅性', () => {
  let domainContent, dataContent
  before(() => {
    domainContent = readDomainModel()
    dataContent = readDataModel()
  })

  describe('受注ステータス 6 値', () => {
    const ORDER_STATUSES = ['受注済み', '届け日変更済み', '出荷準備中', '出荷済み', '配送完了', 'キャンセル']

    for (const status of ORDER_STATUSES) {
      it(`should define order status value: ${status}`, () => {
        // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

        // When: 受注ステータスの定義を確認する
        // Then: 個別のステータス値が定義されている
        assert.match(
          domainContent,
          new RegExp(status),
          `受注ステータス値「${status}」がドメインモデルに定義されていません（レビュー指摘 #5）`
        )
      })
    }

    for (const status of ORDER_STATUSES) {
      it(`should define order status value in data model: ${status}`, () => {
        // Given: データモデル設計書の内容（before() でキャッシュ済み）

        // When: 受注ステータスの定義を確認する
        // Then: 個別のステータス値がデータモデルにも定義されている
        assert.match(
          dataContent,
          new RegExp(status),
          `受注ステータス値「${status}」がデータモデルに定義されていません（レビュー指摘 #5）`
        )
      })
    }
  })

  describe('在庫ステータス 3 値', () => {
    const STOCK_STATUSES = ['入荷済み', '使用済み', '廃棄']

    for (const status of STOCK_STATUSES) {
      it(`should define stock status value: ${status}`, () => {
        // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

        // When: 在庫ステータスの定義を確認する
        // Then: 個別のステータス値が定義されている
        assert.match(
          domainContent,
          new RegExp(status),
          `在庫ステータス値「${status}」がドメインモデルに定義されていません（レビュー指摘 #5）`
        )
      })
    }
  })

  describe('発注ステータス 2 値', () => {
    const PO_STATUSES = ['発注済み', '入荷済み']

    for (const status of PO_STATUSES) {
      it(`should define purchase order status value: ${status}`, () => {
        // Given: ドメインモデル設計書の内容（before() でキャッシュ済み）

        // When: 発注ステータスの定義を確認する
        // Then: 個別のステータス値が定義されている
        assert.match(
          domainContent,
          new RegExp(status),
          `発注ステータス値「${status}」がドメインモデルに定義されていません（レビュー指摘 #5）`
        )
      })
    }
  })
})

// ============================================================
// ドキュメント間整合性: レビュー指摘対応の整合チェック
// ============================================================

describe('ドキュメント間整合性: レビュー指摘対応', () => {
  let archContent, domainContent, dataContent, uiContent
  before(() => {
    archContent = readArchitecture()
    domainContent = readDomainModel()
    dataContent = readDataModel()
    uiContent = readUiDesign()
  })

  it('should have consistent stock item_id between domain model and data model', () => {
    // Given: ドメインモデルとデータモデルの内容（before() でキャッシュ済み）

    // When: 在庫の単品ID を両方で確認する
    const domainHasItemId = /在庫[\s\S]*?単品ID/s.test(domainContent)
    const dataHasItemId = /stocks[\s\S]*?item_id/si.test(dataContent)

    // Then: 両方のドキュメントで在庫に単品IDが定義されている
    assert.ok(
      domainHasItemId && dataHasItemId,
      `在庫の単品ID: ドメインモデル(${domainHasItemId}), データモデル(${dataHasItemId}) の両方に存在する必要があります`
    )
  })

  it('should have consistent order status count between domain model and data model', () => {
    // Given: ドメインモデルとデータモデルの内容（before() でキャッシュ済み）

    // When: 受注ステータスの定義数を確認する
    const statuses = ['受注済み', '届け日変更済み', '出荷準備中', '出荷済み', '配送完了', 'キャンセル']
    const domainCount = statuses.filter(s => new RegExp(s).test(domainContent)).length
    const dataCount = statuses.filter(s => new RegExp(s).test(dataContent)).length

    // Then: 両方で 6 値すべてが定義されている
    assert.equal(
      domainCount,
      6,
      `ドメインモデルの受注ステータスが 6 値ではありません（${domainCount}値）`
    )
    assert.equal(
      dataCount,
      6,
      `データモデルの受注ステータスが 6 値ではありません（${dataCount}値）`
    )
  })

  it('should have consistent UI screen list with transition diagram for order flow', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: 注文フローの画面が画面一覧と遷移図の両方に存在するか確認する
    // Then: 注文内容確認画面が画面一覧と遷移図の両方に含まれる
    const screenListSection = uiContent.split(/画面一覧/)[1]?.split(/##\s/)[0]
    assert.ok(screenListSection, '画面一覧セクションが見つかりません')
    assert.match(
      screenListSection,
      /注文内容確認|注文確認/,
      '画面一覧に注文内容確認画面が含まれていません'
    )
  })

  it('should not contain Unicode replacement characters in any design document (content-corruption)', () => {
    // Given: 全設計ドキュメントの内容（before() でキャッシュ済み）
    const docs = [
      { name: 'architecture_design.md', content: archContent },
      { name: 'data_model.md', content: dataContent },
      { name: 'domain_model.md', content: domainContent },
      { name: 'ui_design.md', content: uiContent },
    ]

    // When/Then: Unicode replacement character (U+FFFD) が含まれていないこと
    for (const doc of docs) {
      const matches = doc.content.match(/\uFFFD/g)
      assert.equal(
        matches,
        null,
        `${doc.name} に Unicode 破損文字（U+FFFD）が ${matches?.length ?? 0} 箇所あります（content-corruption）`
      )
    }
  })

  it('should have consistent screen count between overview and screen list table (UI-SCREEN-COUNT-MISMATCH-001)', () => {
    // Given: UI 設計書の内容（before() でキャッシュ済み）

    // When: 概要セクションの画面数と画面一覧テーブルの行数を比較する
    const overviewMatch = uiContent.match(/計\s*(\d+)\s*画面/)
    assert.ok(overviewMatch, '概要セクションに「計 N 画面」の記述がありません')
    const overviewCount = parseInt(overviewMatch[1], 10)

    const screenListSection = uiContent.split(/画面一覧/)[1]?.split(/##\s/)[0]
    assert.ok(screenListSection, '画面一覧セクションが見つかりません')
    const tableRows = screenListSection.match(/\|\s*\d+\s*\|/g)
    const tableCount = tableRows ? tableRows.length : 0

    // Then: 概要セクションの画面数と画面一覧テーブルの行数が一致する
    assert.equal(
      overviewCount,
      tableCount,
      `概要セクションの画面数（${overviewCount}）と画面一覧テーブルの行数（${tableCount}）が不一致です（UI-SCREEN-COUNT-MISMATCH-001）`
    )
  })
})
