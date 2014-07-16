REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

integration:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		./test/integration \
		--reporter $(REPORTER)	

.PHONY: test