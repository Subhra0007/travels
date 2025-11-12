import StaysExplorer from "../../../stays/StaysExplorer";
import { STAY_CATEGORIES } from "../../../stays/categories";

const VALID_CATEGORIES = STAY_CATEGORIES.map((tab) => tab.value);

export default function ServicesStaysCategoryPage({ params }: { params: { category: string } }) {
  const category = VALID_CATEGORIES.includes(params.category as any) ? params.category : "all";
  return <StaysExplorer initialCategory={category} />;
}
