import { useQueryStates, parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";
const sortValues = ["Recommended", "Trending", "Fresh & Popular"] as const;
export const params = {
    search:parseAsString
    .withOptions({
        clearOnDefault:true,
    })
    .withDefault(""),
    sort: parseAsStringLiteral(sortValues).withDefault("Recommended"),
    minPrice: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),
    maxPrice: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),
    tags: parseAsArrayOf(parseAsString)
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault([]),
}
export const useProductFilters = () => {
    return useQueryStates(params)
}

