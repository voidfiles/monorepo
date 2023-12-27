"use client";
import PanelBackgroundImage from "@/components/PanelBackgroundImage";
import {
  Box,
  Button,
  Card,
  Flex,
  Text,
  Heading,
  TextFieldInput,
  TextArea,
} from "@radix-ui/themes";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <Box my="0" style={{ whiteSpace: "nowrap" }} className="h-screen w-screen">
      <Flex direction="column">
        <Flex justify="center" position="relative" style={{ padding: 100 }}>
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
            className="w-full sm:w-3/4 lg:w-1/2 lg:max-w-2xl"
          >
            <Box height="7" mb="4">
              <Heading as="h3" size="6" mt="-1">
                I'm looking for...
              </Heading>
            </Box>

            <Box mb="5">
              <TextArea
                variant="classic"
                placeholder="Well written essays with though provoking positions"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </Box>

            <Flex mt="6" justify="end" gap="3">
              <Link href={"/results?query=" + search}>
                <Button variant="solid">Find it!</Button>
              </Link>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
}
