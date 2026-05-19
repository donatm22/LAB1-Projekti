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

  return {
    id: `db-${event.id}`,
    backendId: event.id,
    category: category?.emri || "Upcoming",
    speaker: "AURA Event",
    title: event.titulli,
    location: event.lokacioni,
    date: formatEventDate(event.data_fillimit),
    image: event.imazhi || "/best_events/lecture1.jpg",
    isFeatured: true,
    description: event.pershkrimi,
  };
};
