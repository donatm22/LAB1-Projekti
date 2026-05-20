import { API_BASE_URL } from "../config/api";

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

  const resolveImage = (img) => {
    if (!img) return "/profile.svg";
    if (img.startsWith("/uploads/")) {
      const base = API_BASE_URL || "";
      return `${base}${img}`;
    }
    return img;
  };

  return {
    id: `db-${event.id}`,
    backendId: event.id,
    category: category?.emri || "Upcoming",
    speaker: event.speaker || event.titulli || "Upcoming",
    title: event.titulli,
    location: event.lokacioni,
    date: formatEventDate(event.data_fillimit),
    image: resolveImage(event.imazhi),
    isFeatured: true,
    description: event.pershkrimi,
  };
};
