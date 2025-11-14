import AdventuresExplorer from "../../../adventures/AdventuresExplorer";
import { ADVENTURE_CATEGORIES } from "../../../adventures/categories";

const VALID_CATEGORIES = ADVENTURE_CATEGORIES.map((tab) => tab.value);

export default function ServicesAdventuresCategoryPage({ params }: { params: { category: string } }) {
  const category = VALID_CATEGORIES.includes(params.category as any) ? params.category : "all";
  return <AdventuresExplorer initialCategory={category} />;
}


