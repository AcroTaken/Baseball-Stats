import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FilterData {
    
    private static final String[] YEAR_ID_FILES = {
        "AllstarFull.csv", "Appearances.csv", "AwardsManagers.csv", 
        "AwardsPlayers.csv", "AwardsShareManagers.csv", "AwardsSharePlayers.csv",
        "Batting.csv", "BattingPost.csv", "CollegePlaying.csv", 
        "Fielding.csv", "FieldingOF.csv", "FieldingOFsplit.csv", 
        "FieldingPost.csv", "Managers.csv", "ManagersHalf.csv", 
        "Pitching.csv", "PitchingPost.csv", "Salaries.csv", 
        "SeriesPost.csv", "Teams.csv", "TeamsHalf.csv"
    };
    
    private static final Map<String, String> SPECIAL_YEAR_FILES = Map.of(
        "HallOfFame.csv", "yearid",
        "HomeGames.csv", "yearkey"
    );
    
    private static final int MIN_YEAR = 2015;
    private static final String DATA_DIR = "data";
    
    public static void main(String[] args) {
        System.out.println("Filtering CSV files to keep only data from 2015 onwards...\n");
        
        // Process files with yearID column
        for (String filename : YEAR_ID_FILES) {
            processFile(filename, "yearID");
        }
        
        // Process special year column files
        for (Map.Entry<String, String> entry : SPECIAL_YEAR_FILES.entrySet()) {
            processFile(entry.getKey(), entry.getValue());
        }
        
        System.out.println("Filtering complete!");
    }
    
    private static void processFile(String filename, String yearColumn) {
        Path filepath = Paths.get(DATA_DIR, filename);
        
        if (!Files.exists(filepath)) {
            System.out.println("Skipping " + filename + " (file not found)\n");
            return;
        }
        
        try {
            System.out.println("Processing " + filename + "...");
            
            List<String> lines = Files.readAllLines(filepath);
            if (lines.isEmpty()) {
                System.out.println("  File is empty, skipping\n");
                return;
            }
            
            String header = lines.get(0);
            String[] columns = header.split(",");
            
            // Find year column index
            int yearIndex = -1;
            for (int i = 0; i < columns.length; i++) {
                if (columns[i].equals(yearColumn)) {
                    yearIndex = i;
                    break;
                }
            }
            
            if (yearIndex == -1) {
                System.out.println("  Warning: " + yearColumn + " column not found, skipping\n");
                return;
            }
            
            // Filter data
            List<String> filteredLines = new ArrayList<>();
            filteredLines.add(header);
            
            int originalRows = lines.size() - 1;
            int keptRows = 0;
            
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                String[] values = line.split(",", -1);
                
                if (values.length > yearIndex) {
                    try {
                        int year = Integer.parseInt(values[yearIndex].trim());
                        if (year >= MIN_YEAR) {
                            filteredLines.add(line);
                            keptRows++;
                        }
                    } catch (NumberFormatException e) {
                        // Skip rows with invalid year values
                    }
                }
            }
            
            // Write filtered data
            Files.write(filepath, filteredLines);
            
            int removedRows = originalRows - keptRows;
            System.out.println("  " + originalRows + " rows -> " + keptRows + 
                             " rows (removed " + removedRows + " rows)\n");
            
        } catch (IOException e) {
            System.err.println("  Error processing " + filename + ": " + e.getMessage() + "\n");
        }
    }
}
