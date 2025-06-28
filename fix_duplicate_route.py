#!/usr/bin/env python3

def fix_duplicate_route():
    """Remove the duplicate student_download_certificate route"""
    
    with open('app.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find the start and end of the old route (lines 495-575)
    start_line = 494  # 0-indexed
    end_line = 574    # 0-indexed
    
    # Remove the old route
    new_lines = lines[:start_line] + lines[end_line:]
    
    # Write back to file
    with open('app.py', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Removed duplicate route from lines {start_line+1}-{end_line+1}")

if __name__ == "__main__":
    fix_duplicate_route() 