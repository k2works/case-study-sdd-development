package com.frerememoire.webshop.application.bundling;

import java.time.LocalDate;
import java.util.List;

public record BundlingTargetsResult(
        LocalDate shippingDate,
        List<BundlingTarget> targets,
        List<MaterialSummary> materialSummary
) {
}
