type ProfileCompletionPayload = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  address?: {
    houseNo?: string;
    subDistrict?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
  educations?: Array<{
    isPrimary?: boolean;
    university?: string;
    degree?: string;
    major?: string;
  }>;
  skills?: Array<{
    name?: string;
  }>;
  careerExperiences?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
  }>;
  achievements?: Array<{
    title?: string;
  }>;
  linkedin?: string;
  github?: string;
  lineID?: string;
  website?: string;
  interests?: any[];
};

export function calculateProfileCompletion(
  data: ProfileCompletionPayload,
): number {
  let score = 0;

  if (data.firstName?.trim() && data.lastName?.trim()) score += 10;
  if (data.avatar?.trim()) score += 10;
  if (data.phone?.trim()) score += 10;
  if (data.bio?.trim()) score += 10;

  if (Array.isArray(data.interests) && data.interests.length >= 3) {
    score += 5;
  };

  const hasAddress =
    data.address?.houseNo?.trim() ||
    data.address?.subDistrict?.trim() ||
    data.address?.district?.trim() ||
    data.address?.province?.trim() ||
    data.address?.postalCode?.trim();

  if (hasAddress) score += 10;

  if ((data.educations?.length ?? 0) > 0) score += 15;
  if (data.educations?.some((e) => e.isPrimary)) score += 5;

  if ((data.skills?.filter((s) => s.name?.trim()).length ?? 0) >= 3) score += 15;

  if (
    (data.careerExperiences?.filter(
      (c) => c.company?.trim() || c.position?.trim() || c.startDate,
    ).length ?? 0) > 0
  ) {
    score += 15;
  }

  const hasSocial =
    data.linkedin?.trim() ||
    data.github?.trim() ||
    data.lineID?.trim() ||
    data.website?.trim();

  if (hasSocial) score += 10;

  return Math.min(score, 100);
}