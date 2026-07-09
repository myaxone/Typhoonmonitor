// Simple abbreviation expansion for common city and country short forms.
// This list is intentionally small but can be extended.

const cityMap: Record<string, string> = {
    'NYC': 'New York',
    'NEW YORK CITY': 'New York',
    'LA': 'Los Angeles',
    'SF': 'San Francisco',
    'DC': 'Washington',
    'SFO': 'San Francisco',
    'HK': 'Hong Kong',
    'BJ': 'Beijing',
    'SH': 'Shanghai'
};

const countryMap: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'U S A': 'United States',
    'UNITED STATES OF AMERICA': 'United States',
    'UK': 'United Kingdom',
    'GB': 'United Kingdom',
    'ENGLAND': 'United Kingdom',
    'PRC': 'China',
    'CN': 'China',
    'CHN': 'China',
    'UAE': 'United Arab Emirates'
};

export function expandLocation(input: string): string {
    if (!input) return input;
    // Split by commas to separate city and country parts
    const parts = input.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return input;

    // Expand each part using maps (match case-insensitive)
    const expandedParts = parts.map((part, idx) => {
        const up = part.toUpperCase();
        // prefer city map for first part, country map for last part
        if (idx === 0 && cityMap[up]) return cityMap[up];
        if (idx === parts.length - 1 && countryMap[up]) return countryMap[up];
        // fallback: if part is an uppercase abbreviation in either map
        if (cityMap[up]) return cityMap[up];
        if (countryMap[up]) return countryMap[up];
        return part;
    });

    return expandedParts.join(',');
}

export default expandLocation;
