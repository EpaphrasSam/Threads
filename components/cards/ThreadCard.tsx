"use client";

import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Comment from "../forms/Comment";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import {
  LikesCount,
  UserLikesCheck,
  likeThreadOrComment,
} from "@/lib/actions/like.action";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  community: {
    name: string;
    image: string | null;
    id: string;
  } | null;
  createdAt: Date | string;
  comments?: {
    author: {
      image: string | null;
    };
    childComments: any;
  }[];
  isComment?: boolean;
  isChildComment?: boolean;
  likesCount: number;
  userLikes: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  isChildComment,
  likesCount,
  userLikes,
}: Props) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [replying, setReplying] = useState(false);
  const [displayReplies, setDisplayReplies] = useState(0);
  const displayValue = 3;

  const heartIconSrc = userLikes ? "/heart-filled.svg" : "/heart-gray.svg";

  const imageLinks = [
    { src: heartIconSrc, alt: "heart", width: 24, height: 24 },
    ...(isChildComment
      ? []
      : [
          {
            src: "/reply.svg",
            alt: "heart",
            width: 24,
            height: 24,
            href: `/thread/${id}`,
          },
        ]),
    ...(isComment
      ? []
      : [
          { src: "/repost.svg", alt: "repost", width: 24, height: 24 },
          { src: "/share.svg", alt: "share", width: 24, height: 24 },
        ]),
  ];

  const handleLikeClick = async () => {
    try {
      await likeThreadOrComment(currentUserId, id, pathname);
    } catch (error) {
      console.error("Error liking/unliking:", error);
    }
  };

  const toggleReplies = () => {
    if (comments) {
      if (displayReplies === 0) {
        setDisplayReplies(displayValue);
      } else {
        setDisplayReplies(displayReplies + displayValue);
      }
    }
  };

  const hideReplies = () => {
    setDisplayReplies(0);
  };

  const closeReplyForm = () => {
    setReplying(false);
  };

  return (
    <article
      className={`flex w-full ${
        !isChildComment && "mb-4"
      } flex-col rounded-xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              {author.image && (
                <Image
                  src={author.image}
                  alt="Profile Image"
                  fill
                  className="cursor-pointer rounded-full"
                />
              )}
            </Link>

            <div className="thread-card_bar" />
          </div>

          <div className="flex flex-col w-full">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
                {imageLinks.map((image, index) => (
                  <React.Fragment key={index}>
                    {image.href ? (
                      !isComment ? (
                        <Link
                          href={image.href}
                          className="flex flex-row gap-1 hover:brightness-200"
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            height={image.height}
                            width={image.width}
                            className="cursor-pointer object-contain hover:brightness-200"
                          />
                          <p className="text-gray-500">{comments?.length}</p>
                        </Link>
                      ) : (
                        <div className="flex flex-row gap-1">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            height={image.height}
                            width={image.width}
                            className="cursor-pointer object-contain hover:brightness-200"
                            onClick={() => setReplying(!replying)}
                          />
                          <p className="text-gray-500">{comments?.length}</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-row gap-1">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          height={image.height}
                          width={image.width}
                          className="cursor-pointer object-contain hover:brightness-200"
                          onClick={
                            image.alt === "heart" ? handleLikeClick : undefined
                          }
                        />
                        {image.alt === "heart" && (
                          <p className="text-gray-500">{likesCount}</p>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isComment && isHome && comments && (
        <div className="ml-1 mt-3 flex items-center gap-2">
          {comments
            .slice(0, 2)
            .map(
              (comment, index) =>
                comment.author.image && (
                  <Image
                    key={index}
                    src={comment.author.image}
                    alt={`user_${index}`}
                    width={24}
                    height={24}
                    className={`${
                      index !== 0 && "-ml-5"
                    } rounded-full object-cover`}
                  />
                )
            )}

          <Link href={`/thread/${id}`}>
            <p className="mt-1 text-subtle-medium text-gray-1">
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)} - {community.name} Community
          </p>

          {community.image && (
            <Image
              src={community.image}
              alt={community.name}
              width={14}
              height={14}
              className="ml-1 rounded-full object-cover"
            />
          )}
        </Link>
      )}

      {isComment && replying && (
        <div className="pl-16">
          <Comment
            threadId={id}
            currentUserId={JSON.stringify(currentUserId)}
            parentId={parentId}
            onCloseReplyForm={closeReplyForm}
          />
        </div>
      )}

      <div className="mt-3">
        {comments?.map(
          (childthread: any, index) =>
            index < displayReplies && (
              <ThreadCard
                key={childthread?.id}
                id={id}
                currentUserId={currentUserId}
                parentId={childthread?.parentId}
                content={childthread?.text}
                author={childthread?.author}
                community={childthread?.community}
                createdAt={childthread?.createdAt}
                likesCount={childthread?.likesCount}
                userLikes={childthread?.userLikes}
                isComment
                isChildComment
              />
            )
        )}

        <div className="flex mt-2">
          <div className="flex items-center ml-7">
            {comments && isComment && comments?.length > displayReplies && (
              <button
                className="text-light-1 text-small-regular hover:brightness-150"
                onClick={toggleReplies}
              >
                {displayReplies === comments?.length
                  ? `Hide replies`
                  : `View ${
                      displayReplies === 0
                        ? comments?.length
                        : comments?.length - displayReplies
                    } ${displayReplies === 0 ? "replies" : "more replies"}`}
              </button>
            )}
          </div>

          <div className="flex items-center ml-auto">
            {displayReplies > 0 && (
              <button
                className="text-light-1 text-small-regular hover:brightness-150"
                onClick={hideReplies}
              >
                Hide
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
