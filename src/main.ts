import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getLogic() {
  const [charactersTabs, nemesesTabs, secretsTabs] = await Promise.all([
    pool.query(`SELECT 
                *FROM "character"
        `),
    pool.query(`SELECT 
                id, character_id, years
                FROM nemesis
      `),
    pool.query(`SELECT 
                id, nemesis_id, secret_code
                FROM secret
      `),
  ]);

  const characters = charactersTabs.rows;
  const nemeses = nemesesTabs.rows;
  const secrets = secretsTabs.rows;

  // tree
  const characterRecords = characters.map((character) => {
    const nemRecords = nemeses
      .filter((nem) => nem.character_id === character.id)
      .map((nem) => {
        const secRecords = secrets
          .filter((sec) => sec.nemesis_id === nem.id)
          .map((sec) => ({ data: sec, children: {} }));
        return {
          data: nem,
          children: { has_secret: { records: secRecords } },
        };
      });
    return {
      data: character,
      children: { has_nemesis: { records: nemRecords } },
    };
  });

  // pocet char
  const characterCount = characters.length;

  // 0 pro vypocet
  let totalAgeChars = 0;
  let countAgeChars = 0;
  let totalWeight = 0;

  for (const character of characters) {
    // age
    if (character.born) {
      const ageApprox = Math.floor(
        (Date.now() - new Date(character.born).getTime()) /
          (1000 * 3600 * 24 * 365.25)
      );
      totalAgeChars += ageApprox;
      countAgeChars++;
    }

    // weight
    if (character.weight != null) {
      totalWeight += Number(character.weight);
    }
  }

  // nemeses
  let totalAgeNems = 0;
  let countAgeNems = 0;

  for (const nem of nemeses) {
    // nemeses age
    if (nem.years != null) {
      totalAgeNems += Number(nem.years);
      countAgeNems++;
    }
  }

  // avg age
  const averageAgeCharacters = countAgeChars
    ? Math.round(totalAgeChars / countAgeChars)
    : 0;

  // avg age nemeses
  const averageAgeNemeses = countAgeNems
    ? Math.round(totalAgeNems / countAgeNems)
    : 0;

  // avg weight
  const averageWeight = characterCount
    ? Math.round(totalWeight / characterCount)
    : 0;

  return {
    characters: characterRecords,
    characters_count: characterCount,
    average_age_characters: averageAgeCharacters,
    average_age_nemeses: averageAgeNemeses,
    average_weight_of_characters: averageWeight,
  };
}
