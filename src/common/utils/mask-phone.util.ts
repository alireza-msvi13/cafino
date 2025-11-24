export function maskPhones(items: any[]) {
  return items.map((item) => {
    if (
      item.user?.phone &&
      item.user.phone.startsWith('09') &&
      item.user.phone.length >= 11
    ) {
      item.user.phone = item.user.phone.replace(
        /^(\d{4})\d+(\d{3})$/,
        '$1****$2',
      );
    }
    return item;
  });
}
