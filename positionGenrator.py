import json
from faker import Faker  # You may need to install this package using: pip install faker

def generate_fake_position():
    fake = Faker()
    return {
        "positionTitle": fake.job(),
        "unitName": fake.company(),
        "service": fake.random_element(["lohem", "tomeh", "job"]),
        "availability": fake.random_element(["immediate", "notImmediate"]),
        "jobType": fake.random_element(["permanent", "temporary"]),
        "location": fake.random_element(["north", "central", "south"]),
        "jobDescription": fake.text(),
    }

def generate_positions(n):
    positions = [generate_fake_position() for _ in range(n)]
    return positions

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    N = 10  # Change this to the desired number of positions
    positions_data = generate_positions(N)
    save_to_json(positions_data, "positions.json")
