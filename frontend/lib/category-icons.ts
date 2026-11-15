import {
    LampWallUp,
    Grid3X3,
    BedDouble,
    Sofa,
    CookingPot,
    Flower2,
    House,
    type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Lighting: LampWallUp,
    Carpet: Grid3X3,
    Bedroom: BedDouble,
    Furniture: Sofa,
    Kitchen: CookingPot,
    Decoration: Flower2,
};

export const getCategoryIcon = (categoryName: string): LucideIcon => {
    return CATEGORY_ICONS[categoryName] ?? House;
};