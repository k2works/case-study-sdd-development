package com.frerememoire.webshop.infrastructure.api.bundling;

import com.frerememoire.webshop.application.bundling.BundlingTarget;
import com.frerememoire.webshop.application.bundling.BundlingTargetsResult;
import com.frerememoire.webshop.application.bundling.MaterialSummary;

import java.time.LocalDate;
import java.util.List;

public record BundlingTargetsResponse(
        LocalDate shippingDate,
        List<BundlingTarget> targets,
        List<MaterialSummary> materialSummary
) {
    public static BundlingTargetsResponse fromResult(BundlingTargetsResult result) {
        return new BundlingTargetsResponse(
                result.shippingDate(),
                result.targets(),
                result.materialSummary()
        );
    }
}
