HW_TYPE := 8
VERSION := 0.1
REVISION := $(shell echo $$(git log --pretty='%h' -n 1)$$(if git diff-files --quiet && git diff-index --cached --quiet HEAD --; then echo ""; else echo "-dev"; fi))
