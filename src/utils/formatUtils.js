export const normalizeDecimal = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(',', '.'));
  return NaN;
};

export const isValidCoordinate = (lat, lon) => {
  const latitude = normalizeDecimal(lat);
  const longitude = normalizeDecimal(lon);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};
