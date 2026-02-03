def normalize_labels(labels: list[str]) -> list[str]:
    return list(set(label.strip().lower() for label in labels if label.strip()))
