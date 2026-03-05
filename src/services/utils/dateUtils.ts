export const formatDate = (dateString: string | undefined | null, fallback: string = "Not specified"): string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return fallback;
  }
};

export const formatDateCustom = (
  dateString: string | undefined | null,
  options: Intl.DateTimeFormatOptions,
  fallback: string = "Not specified"
): string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleDateString("en-US", options);
  } catch {
    return fallback;
  }
};

export const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return "";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const isValidDate = (dateString: string | undefined | null): boolean => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return false;
  }

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

export const formatDateTime = (dateString: string | undefined | null, fallback: string = "No activity"): string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return fallback;
  }
};

export const formatDateTimeEST = (
  dateString: string | undefined | null,
  fallback: string = "No activity"
): { date: string; time: string } | string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    const dateOnly = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/New_York",
    });

    const timeOnly = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });

    return { date: dateOnly, time: timeOnly };
  } catch {
    return fallback;
  }
};

// Format date and time using local timezone (browser timezone)
export const formatDateTimeLocal = (
  dateString: string | undefined | null,
  fallback: string = "No activity"
): { date: string; time: string } | string => {
  if (!dateString || dateString.trim() === "" || dateString.toLowerCase() === "null") {
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return fallback;
    }

    const dateOnly = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeOnly = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateOnly, time: timeOnly };
  } catch {
    return fallback;
  }
};
