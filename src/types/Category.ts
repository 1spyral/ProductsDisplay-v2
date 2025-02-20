export default interface Category {
    category: string
    name: string | null
}

export function getCategoryName(category: Category | null, fallback: string = "Unknown category") {
    return category?.name || category?.category || fallback
}