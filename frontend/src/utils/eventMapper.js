export const formatEventDate = (value) => {
  if (!value) {
    return "Date TBA";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const mapApiEventToCard = (event, categories = []) => {
  const category = categories.find(
    (item) => Number(item.id) === Number(event.category_id)
  );

  let primaryImage = event.imazhi;

  if (typeof event.imazhi === "string") {
    try {
      const parsedImages = JSON.parse(event.imazhi);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        primaryImage = parsedImages[0];
      }
    } catch {
      primaryImage = event.imazhi;
    }
  }

  return {
    id: `db-${event.id}`,
    backendId: event.id,
    category: category?.emri || "Upcoming",
    speaker: event.speaker || event.titulli || "Upcoming",
    title: event.titulli,
    location: event.lokacioni,
    date: formatEventDate(event.data_fillimit),
    image: primaryImage || "/profile.svg",
    isFeatured: true,
    description: event.pershkrimi,
  };
};
