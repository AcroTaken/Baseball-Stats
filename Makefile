
DB_USER = lahman
DB_NAME = baseball 

all: setup

setup: 
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/00_schema.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/01_constraints.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/02_views.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/03_functions.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/04_triggers.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f sql/05_indexes.sql
	psql -U $(DB_USER) -d $(DB_NAME) -f	sql/06_sample_queries.sql

load:
	psql -U $(DB_USER) -d $(DB_NAME) -f etl/10_copy_commands.sql

rebuild:
	psql -U $(DB_USER) -d $(DB_NAME) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make setup