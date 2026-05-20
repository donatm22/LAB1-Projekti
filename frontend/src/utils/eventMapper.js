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

const parseEventImages = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value ? [value] : [];
  }
};

const resolveImage = (image) => {
  if (!image) {
    return "/profile.svg";
  }

  if (image.startsWith("/uploads/")) {
    return `${API_BASE_URL}${image}`;
  }

  return image;
};

export const mapApiEventToCard = (event, categories = []) => {
  const category = categories.find(
    (item) => Number(item.id) === Number(event.category_id)
  );
  const [primaryImage] = parseEventImages(event.imazhi);

  return {
    id: `db-${event.id}`,
    backendId: event.id,
    category: category?.emri || "Upcoming",
    speaker: event.speaker || event.titulli || "Upcoming",
    title: event.titulli,
    location: event.lokacioni,
    date: formatEventDate(event.data_fillimit),
    image: resolveImage(primaryImage),
    isFeatured: true,
    description: event.pershkrimi,
  };
};
