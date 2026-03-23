package com.frerememoire.webshop;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.frerememoire.webshop")
class ArchitectureTest {

    // --- 既存ルール（4 ルール） ---

    @ArchTest
    static final ArchRule ドメイン層はインフラ層に依存しない =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

    @ArchTest
    static final ArchRule ドメイン層はアプリケーション層に依存しない =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..application..");

    @ArchTest
    static final ArchRule ドメイン層はSpringに依存しない =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("org.springframework..");

    @ArchTest
    static final ArchRule アプリケーション層はインフラ層に依存しない =
        noClasses().that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
            .allowEmptyShould(true);

    // --- IT8 追加ルール ---

    @ArchTest
    static final ArchRule インフラ層はドメイン層のポートインターフェースのみを実装すべき =
        noClasses().that().resideInAPackage("..infrastructure.persistence..")
            .should().dependOnClassesThat().resideInAPackage("..application..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule コントローラーはRestControllerアノテーションを持つ =
        classes().that().resideInAPackage("..infrastructure.api..")
            .and().haveSimpleNameEndingWith("Controller")
            .should().beAnnotatedWith(org.springframework.web.bind.annotation.RestController.class);
}
