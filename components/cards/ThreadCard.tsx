import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
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
  comments: {
    author: {
      image: string | null;
    };
  }[];
  isComment?: boolean;
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
}: Props) => {
  const imageLinks = [
    { src: "/heart-gray.svg", alt: "heart", width: 24, height: 24 },
    {
      src: "/reply.svg",
      alt: "heart",
      width: 24,
      height: 24,
      href: `/thread/${id}`,
    },
    { src: "/repost.svg", alt: "heart", width: 24, height: 24 },
    { src: "/share.svg", alt: "heart", width: 24, height: 24 },
  ];

  return (
    <article
      className={`flex w-full mb-4 flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
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
                <p className="mt-2 text-small-regular text-light-2"></p>
                {imageLinks.map((image, index) => (
                  <React.Fragment key={index}>
                    {image.href ? (
                      <Link href={image.href}>
                        <Image
                          src={image.src}
                          alt={image.alt}
                          height={image.height}
                          width={image.width}
                          className="cursor-pointer object-contain hover:brightness-200"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        height={image.height}
                        width={image.width}
                        className="cursor-pointer object-contain hover:brightness-200"
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {isComment && comments?.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
