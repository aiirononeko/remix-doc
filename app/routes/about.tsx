import type {
	LoaderArgs,
	V2_MetaFunction,
	HeadersFunction,
	SerializeFrom,
} from "@vercel/remix";
import { json } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react'

import invariant from "tiny-invariant";
import { getContent } from "~/utils/blog.server";
import { CacheControl } from "~/utils/cache-control.server";

import { MarkdownView } from "~/components/Markdown";
import { parseMarkdown } from "~/utils/markdoc.server";

import { getSeo } from "~/seo";
export const meta: V2_MetaFunction = ({ data, matches }) => {
	if(!data) return [];

	const parentData = matches.flatMap((match) => match.data ?? [] );

	return [
		getSeo({
			title: data.post.frontmatter.meta.title,
			description: data.post.frontmatter.meta.description,
			url: `${parentData[0].requestInfo.url}`,
		}),  
	]
}

export const loader = async ({params}: LoaderArgs) => {
	const files = await getContent(`pages/about`);
	let post = files && parseMarkdown(files[0].content);

	invariant(post, "Not found");

	return json({post}, {
		headers: {
			"Cache-Control": new CacheControl("swr").toString(),
		}
	})
}

export const headers: HeadersFunction = ({loaderHeaders}) => {
	return {
		'Cache-Control': loaderHeaders.get('Cache-Control')!
	}
}

export default function BlogPost() {
	const {post} = useLoaderData<typeof loader>();

	return (
		<article className="flex flex-col items-start justify-center w-full max-w-2xl mx-auto mb-16">
			<h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl dark:text-white">{post.frontmatter.meta.title}</h1>
			<div className="w-full mt-4 prose dark:prose-dark max-w-none">
				{post.body && <MarkdownView content={post.body} />}
			</div>
		</article>
	)
}
