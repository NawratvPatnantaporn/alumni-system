import { MOCK_USER_SKILLS } from "../mock/userSkills";
import { calculateMatchScore } from "./matching";

const anotherUser = [...MOCK_USER_SKILLS];

const score = calculateMatchScore(
    MOCK_USER_SKILLS,
    anotherUser
)