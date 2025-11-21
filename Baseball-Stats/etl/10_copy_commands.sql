\copy Teams FROM 'data/Teams.csv' CSV HEADER;
\copy Appearances(yearID, teamID, lgID, playerID, G_all, GS, G_batting, G_defense,
  G_p, G_c, G_1b, G_2b, G_3b, G_ss, G_lf, G_cf, G_rf, G_of, G_dh, G_ph, G_pr
) FROM 'data/Appearances.csv' CSV HEADER;
\copy Batting FROM 'data/Batting.csv' CSV HEADER;
\copy Pitching FROM 'data/Pitching.csv' CSV HEADER;
