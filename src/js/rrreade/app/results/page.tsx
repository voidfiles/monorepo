"use client";
import PanelBackgroundImage from "@/components/PanelBackgroundImage";
import TimeFilter, { TimeItems, TimeOptions } from "@/components/TimeFilter";
import MockSearchResults from "@/lib/metaphore/mock";
import {
  Box,
  Button,
  Card,
  Flex,
  Text,
  Heading,
  TextFieldInput,
  TextArea,
  Separator,
  Grid,
} from "@radix-ui/themes";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Search {
  query: string | null;
  time_filter: TimeOptions | null;
}

export default function Results() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const query = searchParams.get("query");
  let passedTimeFilter = (searchParams.get("time_filter") ||
    TimeOptions.ANY_TIME) as TimeOptions;

  const urlOptions: Search = {
    query: query,
    time_filter: passedTimeFilter,
  };

  const data = getData(urlOptions);

  return (
    <Box my="0" className="h-screen w-screen">
      <Flex direction="column">
        <Flex justify="center" position="relative">
          <Flex
            align="center"
            justify="center"
            position="absolute"
            inset="0"
            style={{ overflow: "hidden" }}
          >
            <PanelBackgroundImage id="1" width="100%" height="200%" />
          </Flex>

          <Card
            variant="classic"
            className="w-full sm:w-3/4 lg:w-3/4 lg:max-w-2xl mt-9"
          >
            <Box height="6" mb="2">
              <Heading as="h3" size="6" mt="-1" mb="3">
                Here's what we found for...
              </Heading>
            </Box>
            <Box mb="1">
              <TextArea
                variant="classic"
                placeholder="Well written essays with though provoking positions"
                value={query || ""}
              />
            </Box>
            <Grid columns="2" gap="3" width="auto">
              <Box>
                <Flex mt="2" justify="start" gap="3">
                  <TimeFilter
                    currentValue={passedTimeFilter}
                    onChange={(value) => {
                      router.push(
                        pathname + "?" + createQueryString("time_filter", value)
                      );
                    }}
                  ></TimeFilter>
                </Flex>
              </Box>
              <Box>
                <Flex mt="2" justify="end" gap="3">
                  <Link href={pathname + "?" + searchParams.toString()}>
                    <Button variant="solid">Find it!</Button>
                  </Link>
                </Flex>
              </Box>
            </Grid>
            <Separator my="3" size="4" />
            <Box mb="5">
              <ul>
                {data.results.map((r) => {
                  return (
                    <li key={r.id}>
                      <Box mb="5">
                        <Link href={r.url}>
                          <Box>
                            <Text size={"1"} color="gray">
                              {r.url}
                            </Text>
                            <Text size={"1"} ml={"2"} color="gray">
                              {r.publishedDate}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="3">{r.title}</Text>
                          </Box>
                        </Link>
                      </Box>
                    </li>
                  );
                })}
              </ul>
            </Box>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
}

function getData(query: Partial<Search>) {
  return MockSearchResults;
}
