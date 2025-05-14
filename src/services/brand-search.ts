/**
 * Represents a brand with its name and ID.
 */
export interface Brand {
  /**
   * The unique identifier for the brand.
   */
  id: string;
  /**
   * The name of the brand.
   */
  name: string;
}

/**
 * Asynchronously retrieves brand suggestions based on a query.
 *
 * @param query The search query to find brands.
 * @returns A promise that resolves to an array of Brand objects.
 */
export async function getBrandSuggestions(query: string): Promise<Brand[]> {
  // TODO: Implement this by calling an API.
  return [
    { id: 'nike', name: 'Nike' },
    { id: 'starbucks', name: 'Starbucks' },
    { id: 'adidas', name: 'Adidas' },
  ];
}
