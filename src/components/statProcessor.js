// Count date for an attribute
// Assuming the attribute has a `created_at` field with `YYYY-MM-DDTHH:MM:SSZ` form
export function processAttribute(stats, attributeName)
{
  try
  {
    const attribute = stats[attributeName];
    if (!attribute) throw new Error(`Stat doesn't have the attribute: ${attributeName}`);
    const sortedAttribute = attribute.map(x => x.created_at.slice(5, 10)).sort();
    const attributeCountsByDate = sortedAttribute.reduce((acc, date) =>
    {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {})
    const attributeCountArray = Object.entries(attributeCountsByDate).map(([date, count]) => ({ date, count }));
    console.log(attributeName, attributeCountArray.length);
    return attributeCountArray;
  }
  catch (exception)
  {
    console.log(exception);
  }
}